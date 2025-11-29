import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Cron Job: Auto-adjust workout plans and resolve conflicts
 * Run this every 6 hours via Vercel Cron or similar
 * 
 * Vercel cron config (vercel.json):
 * {
 *   "crons": [{
 *     "path": "/api/cron/auto-adjustments",
 *     "schedule": "0 0,6,12,18 * * *"
 *   }]
 * }
 */
export async function GET(req: NextRequest) {
  try {
    // Verify cron secret (security)
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const results = {
      conflictsDetected: 0,
      conflictsResolved: 0,
      plansAdjusted: 0,
      errors: [] as string[],
    };

    // ===================================
    // 1. AUTO-DETECT SCHEDULING CONFLICTS
    // ===================================
    
    const activeTrainers = await prisma.user.findMany({
      where: { 
        role: 'TRAINER',
        isAvailable: true 
      },
      select: { id: true },
    });

    for (const trainer of activeTrainers) {
      try {
        // Get upcoming sessions
        const sessions = await prisma.trainerSession.findMany({
          where: {
            trainerId: trainer.id,
            scheduledAt: {
              gte: new Date(),
              lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next 7 days
            },
            status: { in: ['SCHEDULED', 'CONFIRMED'] },
          },
          orderBy: { scheduledAt: 'asc' },
        });

        // Check for double bookings
        const timeMap = new Map<number, string>();
        for (const session of sessions) {
          const timeKey = session.scheduledAt.getTime();
          
          if (timeMap.has(timeKey)) {
            // Double booking detected!
            const existingConflict = await prisma.schedulingConflict.findFirst({
              where: {
                sessionId: session.id,
                status: { in: ['pending', 'resolving'] },
              },
            });

            if (!existingConflict) {
              await prisma.schedulingConflict.create({
                data: {
                  sessionId: session.id,
                  trainerId: trainer.id,
                  clientId: session.clientId || session.appClientId || 'unknown',
                  originalTime: session.scheduledAt,
                  conflictType: 'double_booking',
                  severity: 'critical',
                  conflictReason: 'Automatic detection: Double booking',
                  detectedBy: 'system',
                },
              });
              results.conflictsDetected++;
            }
          }
          
          timeMap.set(timeKey, session.id);
        }
      } catch (error) {
        results.errors.push(`Trainer ${trainer.id}: ${error}`);
      }
    }

    // ===================================
    // 2. AUTO-RESOLVE CONFLICTS
    // ===================================
    
    const pendingConflicts = await prisma.schedulingConflict.findMany({
      where: {
        status: 'pending',
        severity: { in: ['high', 'critical'] },
        detectedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
      take: 50,
    });

    for (const conflict of pendingConflicts) {
      try {
        // Get trainer's auto-reschedule rules
        const rule = await prisma.reschedulingRule.findFirst({
          where: {
            trainerId: conflict.trainerId,
            isActive: true,
            autoReschedule: true,
          },
        });

        if (rule) {
          // Trigger auto-resolution
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_APP_URL}/api/scheduling/conflicts/resolve`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.INTERNAL_API_KEY}`,
              },
              body: JSON.stringify({ conflictId: conflict.id }),
            }
          );

          if (response.ok) {
            const data = await response.json();
            if (data.autoResolved) {
              results.conflictsResolved++;
            }
          }
        }
      } catch (error) {
        results.errors.push(`Conflict ${conflict.id}: ${error}`);
      }
    }

    // ===================================
    // 3. AUTO-ADJUST WORKOUT PLANS
    // ===================================
    
    const plansNeedingAdjustment = await prisma.workoutPlan.findMany({
      where: {
        status: 'active',
        autoAdjust: true,
        OR: [
          // Low adherence (< 60%)
          { adherenceScore: { lt: 0.6 } },
          // Low completion rate (< 70%)
          { completionRate: { lt: 0.7 } },
          // Sessions flagged for adjustment
          {
            workouts: {
              some: {
                needsAdjustment: true,
                difficultyRating: { not: null },
              },
            },
          },
        ],
      },
      include: {
        workouts: {
          where: {
            OR: [
              { needsAdjustment: true },
              { difficultyRating: { in: [1, 2, 5] } }, // Too easy or too hard
            ],
          },
          take: 5,
        },
      },
      take: 20,
    });

    for (const plan of plansNeedingAdjustment) {
      try {
        // Determine trigger
        let trigger = 'low_adherence';
        let reason = `Adherence score: ${(plan.adherenceScore || 0) * 100}%`;

        if (plan.completionRate < 0.7) {
          trigger = 'missed_sessions';
          reason = `Completion rate: ${(plan.completionRate || 0) * 100}%`;
        }

        if (plan.workouts.some(w => w.difficultyRating === 1 || w.difficultyRating === 2)) {
          trigger = 'client_feedback';
          reason = 'Client reports workouts too easy';
        }

        if (plan.workouts.some(w => w.difficultyRating === 5)) {
          trigger = 'client_feedback';
          reason = 'Client reports workouts too difficult';
        }

        // Trigger adjustment
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL}/api/workouts/adjust`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.INTERNAL_API_KEY}`,
            },
            body: JSON.stringify({
              planId: plan.id,
              trigger,
              reason,
              clientFeedback: plan.workouts.map(w => ({
                sessionId: w.id,
                rating: w.difficultyRating,
                notes: w.clientNotes,
              })),
            }),
          }
        );

        if (response.ok) {
          results.plansAdjusted++;
        }
      } catch (error) {
        results.errors.push(`Plan ${plan.id}: ${error}`);
      }
    }

    // ===================================
    // 4. UPDATE METRICS
    // ===================================
    
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    for (const trainer of activeTrainers) {
      try {
        const conflicts = await prisma.schedulingConflict.findMany({
          where: {
            trainerId: trainer.id,
            createdAt: { gte: weekAgo },
          },
        });

        const totalConflicts = conflicts.length;
        const autoResolved = conflicts.filter(c => c.resolutionType === 'auto_reschedule').length;
        const manualResolved = conflicts.filter(c => c.resolutionType === 'manual').length;
        const unresolved = conflicts.filter(c => c.status === 'pending').length;

        await prisma.reschedulingMetrics.create({
          data: {
            trainerId: trainer.id,
            periodStart: weekAgo,
            periodEnd: now,
            totalConflicts,
            autoResolved,
            manualResolved,
            unresolved,
            autoResolveRate: totalConflicts > 0 ? autoResolved / totalConflicts : 0,
            hoursAutoSaved: autoResolved * 0.25, // Est. 15 min saved per auto-resolution
          },
        });
      } catch (error) {
        results.errors.push(`Metrics for ${trainer.id}: ${error}`);
      }
    }

    return NextResponse.json({
      success: true,
      ...results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { error: 'Cron job failed', details: error },
      { status: 500 }
    );
  }
}


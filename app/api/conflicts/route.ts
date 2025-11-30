import { NextRequest, NextResponse } from "next/server"
import { getOrCreateUser } from "@/lib/get-or-create-user"
import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/send-email"

// GET /api/conflicts - Detect and return schedule conflicts
export async function GET(req: NextRequest) {
  try {
    const trainer = await getOrCreateUser()
    if (!trainer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all scheduled sessions for this trainer
    const sessions = await prisma.trainerSession.findMany({
      where: {
        trainerId: trainer.id,
        status: { in: ['SCHEDULED', 'CONFIRMED'] },
        scheduledAt: {
          gte: new Date() // Only future/current sessions
        }
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        scheduledAt: 'asc'
      }
    })

    // Detect conflicts (overlapping sessions)
    const conflicts: any[] = []
    
    for (let i = 0; i < sessions.length; i++) {
      const session1 = sessions[i]
      const session1End = new Date(session1.scheduledAt.getTime() + (session1.duration || 60) * 60000)
      
      for (let j = i + 1; j < sessions.length; j++) {
        const session2 = sessions[j]
        const session2End = new Date(session2.scheduledAt.getTime() + (session2.duration || 60) * 60000)
        
        // Check if sessions overlap
        const overlaps = (
          (session1.scheduledAt <= session2.scheduledAt && session1End > session2.scheduledAt) ||
          (session2.scheduledAt <= session1.scheduledAt && session2End > session1.scheduledAt)
        )
        
        if (overlaps) {
          conflicts.push({
            id: `conflict-${session1.id}-${session2.id}`,
            type: 'OVERLAP',
            severity: 'HIGH',
            sessions: [
              {
                id: session1.id,
                title: session1.title,
                client: session1.client?.name || 'Unknown',
                clientId: session1.clientId,
                clientEmail: session1.client?.email,
                scheduledAt: session1.scheduledAt,
                duration: session1.duration,
                location: session1.location
              },
              {
                id: session2.id,
                title: session2.title,
                client: session2.client?.name || 'Unknown',
                clientId: session2.clientId,
                clientEmail: session2.client?.email,
                scheduledAt: session2.scheduledAt,
                duration: session2.duration,
                location: session2.location
              }
            ],
            suggestedActions: [
              'Cancel one session',
              'Reschedule one session',
              'Change session duration'
            ]
          })
        }
      }
    }

    // Detect back-to-back sessions (warning, not error)
    const warnings: any[] = []
    for (let i = 0; i < sessions.length - 1; i++) {
      const session1 = sessions[i]
      const session2 = sessions[i + 1]
      const session1End = new Date(session1.scheduledAt.getTime() + (session1.duration || 60) * 60000)
      
      // If less than 15 minutes between sessions
      const gapMinutes = (session2.scheduledAt.getTime() - session1End.getTime()) / 60000
      
      if (gapMinutes < 15 && gapMinutes >= 0) {
        warnings.push({
          id: `warning-${session1.id}-${session2.id}`,
          type: 'TIGHT_SCHEDULE',
          severity: 'MEDIUM',
          message: `Only ${Math.round(gapMinutes)} minutes between sessions`,
          sessions: [
            {
              id: session1.id,
              client: session1.client?.name,
              scheduledAt: session1.scheduledAt,
              duration: session1.duration
            },
            {
              id: session2.id,
              client: session2.client?.name,
              scheduledAt: session2.scheduledAt,
              duration: session2.duration
            }
          ]
        })
      }
    }

    return NextResponse.json({
      success: true,
      conflicts,
      warnings,
      summary: {
        totalConflicts: conflicts.length,
        totalWarnings: warnings.length,
        requiresAttention: conflicts.length > 0
      }
    })
  } catch (error) {
    console.error("Error fetching conflicts:", error)
    return NextResponse.json(
      { error: "Failed to fetch conflicts" },
      { status: 500 }
    )
  }
}

// POST /api/conflicts - Resolve a conflict
export async function POST(req: NextRequest) {
  try {
    const trainer = await getOrCreateUser()
    if (!trainer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { conflictId, action, sessionId, newTime, newDate } = body

    if (!action || !sessionId) {
      return NextResponse.json(
        { error: "Action and sessionId are required" },
        { status: 400 }
      )
    }

    const session = await prisma.trainerSession.findFirst({
      where: {
        id: sessionId,
        trainerId: trainer.id
      },
      include: {
        client: true
      }
    })

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    if (action === 'cancel') {
      // Cancel the session
      await prisma.trainerSession.update({
        where: { id: sessionId },
        data: { status: 'CANCELLED', updatedAt: new Date() }
      })

      // Notify client
      if (session.client?.email) {
        await sendEmail({
          to: session.client.email,
          subject: 'Session Cancelled',
          html: `<h2>Session Cancelled</h2><p>Your session on ${session.scheduledAt.toLocaleString()} has been cancelled due to a scheduling conflict.</p><p>We apologize for the inconvenience. Please contact us to reschedule.</p>`,
          text: `Your session on ${session.scheduledAt.toLocaleString()} has been cancelled. Please contact us to reschedule.`
        })
      }

      return NextResponse.json({
        success: true,
        message: 'Session cancelled and client notified',
        action: 'cancelled'
      })
    } else if (action === 'reschedule' && newDate && newTime) {
      // Reschedule the session
      const newDateTime = new Date(`${newDate}T${newTime}:00`)
      
      await prisma.trainerSession.update({
        where: { id: sessionId },
        data: {
          scheduledAt: newDateTime,
          updatedAt: new Date()
        }
      })

      // Notify client
      if (session.client?.email) {
        await sendEmail({
          to: session.client.email,
          subject: 'Session Rescheduled',
          html: `<h2>Session Rescheduled</h2><p>Your session has been rescheduled to:</p><p><strong>${newDateTime.toLocaleString()}</strong></p><p>See you then!</p>`,
          text: `Your session has been rescheduled to ${newDateTime.toLocaleString()}`
        })
      }

      return NextResponse.json({
        success: true,
        message: 'Session rescheduled and client notified',
        action: 'rescheduled',
        newTime: newDateTime
      })
    } else {
      return NextResponse.json(
        { error: "Invalid action or missing parameters" },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error("Error resolving conflict:", error)
    return NextResponse.json(
      { error: "Failed to resolve conflict" },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/guest/convert - Convert anonymous session to real user
export async function POST(req: NextRequest) {
  try {
    const {
      sessionToken,
      userId,
      conversionTrigger,
    } = await req.json();

    if (!sessionToken || !userId) {
      return NextResponse.json(
        { error: 'sessionToken and userId are required' },
        { status: 400 }
      );
    }

    // Get anonymous session
    const session = await prisma.anonymousSession.findUnique({
      where: { sessionToken },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Anonymous session not found' },
        { status: 404 }
      );
    }

    // Check if already converted
    if (session.convertedToUserId) {
      return NextResponse.json(
        { error: 'Session already converted', userId: session.convertedToUserId },
        { status: 400 }
      );
    }

    // Start transaction to migrate all data
    const result = await prisma.$transaction(async (tx) => {
      // 1. Mark session as converted
      const convertedSession = await tx.anonymousSession.update({
        where: { sessionToken },
        data: {
          convertedToUserId: userId,
          convertedAt: new Date(),
          conversionTrigger: conversionTrigger || 'manual',
        },
      });

      // 2. Migrate interactions to the real user
      const interactions = await tx.userInteraction.updateMany({
        where: {
          userId: sessionToken, // Anonymous interactions use sessionToken as userId
        },
        data: {
          userId: userId, // Update to real userId
        },
      });

      // 3. Get onboarding preferences
      const onboardingPrefs = await tx.onboardingPreference.findUnique({
        where: { sessionToken },
      });

      // 4. Create/update user preferences from onboarding data
      if (onboardingPrefs) {
        // Build preferences object
        const workoutTypesPrefs: any = {};
        onboardingPrefs.workoutTypes.forEach((type) => {
          workoutTypesPrefs[type] = 0.8; // Start with high score
        });

        await tx.userPreference.upsert({
          where: { userId },
          update: {
            workoutTypes: workoutTypesPrefs,
            intensityLevel: onboardingPrefs.experience || 'medium',
            preferredTimes: onboardingPrefs.availability,
            maxDistance: onboardingPrefs.maxDistance,
            specialties: onboardingPrefs.fitnessGoals.reduce((acc: any, goal) => {
              acc[goal] = 0.8;
              return acc;
            }, {}),
          },
          create: {
            userId,
            workoutTypes: workoutTypesPrefs,
            intensityLevel: onboardingPrefs.experience || 'medium',
            preferredTimes: onboardingPrefs.availability,
            preferredDays: [],
            maxDistance: onboardingPrefs.maxDistance,
            specialties: onboardingPrefs.fitnessGoals.reduce((acc: any, goal) => {
              acc[goal] = 0.8;
              return acc;
            }, {}),
            trainerIds: [],
            trainerStyles: {},
            contentFormats: { video: 1.0, audio: 0.5, text: 0.3 },
            videoLength: 'medium',
          },
        });
      }

      // 5. Migrate feed sessions
      await tx.feedSession.updateMany({
        where: { userId: sessionToken },
        data: { userId: userId },
      });

      return {
        session: convertedSession,
        migratedInteractions: interactions.count,
        migratedPreferences: !!onboardingPrefs,
      };
    });

    return NextResponse.json({
      ...result,
      message: 'Anonymous session converted successfully',
    });
  } catch (error) {
    console.error('Error converting session:', error);
    return NextResponse.json(
      { error: 'Failed to convert session' },
      { status: 500 }
    );
  }
}

// GET /api/guest/convert/stats - Get conversion statistics
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get('days') || '30');

    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Get conversion stats
    const totalSessions = await prisma.anonymousSession.count({
      where: {
        createdAt: { gte: since },
      },
    });

    const convertedSessions = await prisma.anonymousSession.count({
      where: {
        createdAt: { gte: since },
        convertedToUserId: { not: null },
      },
    });

    const conversionsByTrigger = await prisma.anonymousSession.groupBy({
      by: ['conversionTrigger'],
      where: {
        createdAt: { gte: since },
        convertedToUserId: { not: null },
      },
      _count: true,
    });

    const conversionRate = totalSessions > 0
      ? (convertedSessions / totalSessions) * 100
      : 0;

    return NextResponse.json({
      stats: {
        totalSessions,
        convertedSessions,
        conversionRate: `${conversionRate.toFixed(2)}%`,
        conversionsByTrigger,
      },
      period: {
        days,
        from: since.toISOString(),
        to: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching conversion stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}


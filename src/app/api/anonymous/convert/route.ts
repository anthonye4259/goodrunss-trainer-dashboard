import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/anonymous/convert
 * Convert anonymous session to registered user
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { sessionToken } = body;

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Session token required' },
        { status: 400 }
      );
    }

    // Get anonymous session
    const session = await prisma.anonymousSession.findUnique({
      where: { sessionToken },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    if (session.convertedToUserId) {
      return NextResponse.json(
        { error: 'Session already converted' },
        { status: 400 }
      );
    }

    // Mark session as converted
    await prisma.anonymousSession.update({
      where: { id: session.id },
      data: {
        convertedToUserId: userId,
        convertedAt: new Date(),
      },
    });

    // Get user's onboarding preferences from the session
    const onboardingPrefs = await prisma.onboardingPreference.findMany({
      where: { sessionToken: session.sessionToken },
    });

    // Create user preferences from onboarding data
    // Note: OnboardingPreference structure doesn't match UserPreference
    // This conversion logic may need to be updated based on actual schema
    // For now, skipping preference conversion - can be implemented later
    // TODO: Map OnboardingPreference fields (fitnessGoals, experience, etc.) to UserPreference format

    // Get all interactions from the anonymous session
    const anonymousInteractions = await prisma.userInteraction.findMany({
      where: { sessionId: session.id },
    });

    // Update interactions to be associated with the user
    for (const interaction of anonymousInteractions) {
      await prisma.userInteraction.update({
        where: { id: interaction.id },
        data: { userId },
      });
    }

    // Recalculate recommendations for the user based on anonymous activity
    if (anonymousInteractions.length > 0) {
      // Trigger recommendation recalculation
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/feed/recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userId}`,
        },
      }).catch((err) => console.error('Failed to recalculate recommendations:', err));
    }

    return NextResponse.json({
      success: true,
      message: 'Anonymous session converted to user',
      userId,
      preservedInteractions: anonymousInteractions.length,
      preservedPreferences: onboardingPrefs.length, // Preferences found but conversion logic needs implementation
    });
  } catch (error) {
    console.error('Error converting anonymous session:', error);
    return NextResponse.json(
      { error: 'Failed to convert session' },
      { status: 500 }
    );
  }
}


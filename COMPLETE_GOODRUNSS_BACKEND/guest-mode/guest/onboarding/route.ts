import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/guest/onboarding - Save onboarding preferences (before signup)
export async function POST(req: NextRequest) {
  try {
    const {
      sessionToken,
      fitnessGoals,
      experience,
      workoutTypes,
      availability,
      location,
      maxDistance,
      budgetRange,
      step,
    } = await req.json();

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'sessionToken is required' },
        { status: 400 }
      );
    }

    // Upsert onboarding preferences
    const preferences = await prisma.onboardingPreference.upsert({
      where: { sessionToken },
      update: {
        fitnessGoals: fitnessGoals || [],
        experience,
        workoutTypes: workoutTypes || [],
        availability: availability || [],
        location,
        maxDistance,
        budgetRange,
        completedAt: step === 'complete' ? new Date() : null,
      },
      create: {
        sessionToken,
        fitnessGoals: fitnessGoals || [],
        experience,
        workoutTypes: workoutTypes || [],
        availability: availability || [],
        location,
        maxDistance,
        budgetRange,
        completedAt: step === 'complete' ? new Date() : null,
      },
    });

    // Update anonymous session
    await prisma.anonymousSession.update({
      where: { sessionToken },
      data: {
        hasCompletedOnboarding: step === 'complete',
        onboardingStep: step === 'complete' ? 999 : (step || 0),
        onboardingData: {
          fitnessGoals,
          experience,
          workoutTypes,
          availability,
          location,
          maxDistance,
          budgetRange,
        },
      },
    });

    return NextResponse.json({
      preferences,
      message: step === 'complete' ? 'Onboarding completed!' : 'Preferences saved',
    });
  } catch (error) {
    console.error('Error saving onboarding preferences:', error);
    return NextResponse.json(
      { error: 'Failed to save preferences' },
      { status: 500 }
    );
  }
}

// GET /api/guest/onboarding - Get onboarding preferences
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionToken = searchParams.get('sessionToken');

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'sessionToken is required' },
        { status: 400 }
      );
    }

    const preferences = await prisma.onboardingPreference.findUnique({
      where: { sessionToken },
    });

    if (!preferences) {
      return NextResponse.json(
        { error: 'No preferences found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ preferences });
  } catch (error) {
    console.error('Error fetching onboarding preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    );
  }
}


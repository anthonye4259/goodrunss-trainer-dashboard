import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/notifications/preferences?userId=xxx
 * Get notification preferences for a user
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Get or create preferences
    let preferences = await prisma.notificationPreference.findUnique({
      where: { userId }
    });

    if (!preferences) {
      // Create default preferences (all enabled)
      preferences = await prisma.notificationPreference.create({
        data: {
          userId,
          bookingConfirmedEnabled: true,
          bookingReminderEnabled: true,
          bookingCancelledEnabled: true,
          bookingRescheduledEnabled: true,
          sessionCompletedEnabled: true,
          messageReceivedEnabled: true,
          workoutPlanReadyEnabled: true,
          paymentReceivedEnabled: true,
          paymentDueEnabled: true,
          trainerNoteEnabled: true,
          promoOfferEnabled: true,
        }
      });
    }

    return NextResponse.json({
      success: true,
      preferences
    });
  } catch (error: any) {
    console.error('Error getting notification preferences:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get preferences' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/notifications/preferences
 * Update notification preferences for a user
 */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, preferences } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Update or create preferences
    const updated = await prisma.notificationPreference.upsert({
      where: { userId },
      update: preferences,
      create: {
        userId,
        ...preferences
      }
    });

    return NextResponse.json({
      success: true,
      preferences: updated
    });
  } catch (error: any) {
    console.error('Error updating notification preferences:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update preferences' },
      { status: 500 }
    );
  }
}

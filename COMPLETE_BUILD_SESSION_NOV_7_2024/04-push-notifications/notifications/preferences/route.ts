import { NextRequest, NextResponse } from 'next/server';
import { firestoreAdmin } from '@/lib/firebase-admin';

// GET /api/notifications/preferences - Get user's notification preferences
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

    const doc = await firestoreAdmin
      .collection('notification_preferences')
      .doc(userId)
      .get();

    if (!doc.exists) {
      // Return default preferences
      return NextResponse.json({
        preferences: {
          booking_confirmed: true,
          booking_reminder_24h: true,
          booking_reminder_1h: true,
          booking_cancelled: true,
          new_message: true,
          waitlist_available: true,
          payment_confirmed: true,
          review_received: true,
          trainer_response: true,
          promotional: false,
        },
      });
    }

    return NextResponse.json({
      preferences: doc.data(),
    });
  } catch (error: any) {
    console.error('Error fetching notification preferences:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch preferences' },
      { status: 500 }
    );
  }
}

// PUT /api/notifications/preferences - Update notification preferences
export async function PUT(req: NextRequest) {
  try {
    const { userId, preferences } = await req.json();

    if (!userId || !preferences) {
      return NextResponse.json(
        { error: 'userId and preferences are required' },
        { status: 400 }
      );
    }

    await firestoreAdmin
      .collection('notification_preferences')
      .doc(userId)
      .set(preferences, { merge: true });

    return NextResponse.json({
      preferences,
      message: 'Preferences updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating notification preferences:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update preferences' },
      { status: 500 }
    );
  }
}


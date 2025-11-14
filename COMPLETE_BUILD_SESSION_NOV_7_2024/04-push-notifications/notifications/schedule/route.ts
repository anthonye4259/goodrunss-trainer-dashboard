import { NextRequest, NextResponse } from 'next/server';
import { firestoreAdmin } from '@/lib/firebase-admin';

// POST /api/notifications/schedule - Schedule notification
export async function POST(req: NextRequest) {
  try {
    const {
      userId,
      userIds,
      title,
      body,
      data,
      imageUrl,
      type,
      scheduledFor, // ISO timestamp
      recurring, // 'daily', 'weekly', or null
    } = await req.json();

    if ((!userId && !userIds) || !title || !body || !scheduledFor) {
      return NextResponse.json(
        { error: 'userId/userIds, title, body, and scheduledFor are required' },
        { status: 400 }
      );
    }

    const scheduledDate = new Date(scheduledFor);
    if (scheduledDate < new Date()) {
      return NextResponse.json(
        { error: 'scheduledFor must be in the future' },
        { status: 400 }
      );
    }

    // Save scheduled notification to Firestore
    const notification = {
      userId: userId || null,
      userIds: userIds || null,
      title,
      body,
      data,
      imageUrl,
      type: type || 'general',
      scheduledFor: scheduledDate,
      recurring: recurring || null,
      status: 'scheduled', // scheduled, sent, failed
      createdAt: new Date(),
    };

    const docRef = await firestoreAdmin
      .collection('scheduled_notifications')
      .add(notification);

    return NextResponse.json({
      id: docRef.id,
      ...notification,
      message: 'Notification scheduled successfully',
    });
  } catch (error: any) {
    console.error('Error scheduling notification:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to schedule notification' },
      { status: 500 }
    );
  }
}

// GET /api/notifications/schedule - Get scheduled notifications
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status') || 'scheduled';

    let query = firestoreAdmin
      .collection('scheduled_notifications')
      .where('status', '==', status);

    if (userId) {
      query = query.where('userId', '==', userId);
    }

    const snapshot = await query.orderBy('scheduledFor', 'asc').get();

    const notifications = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      notifications,
      count: notifications.length,
    });
  } catch (error: any) {
    console.error('Error fetching scheduled notifications:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch scheduled notifications' },
      { status: 500 }
    );
  }
}

// DELETE /api/notifications/schedule - Cancel scheduled notification
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'id is required' },
        { status: 400 }
      );
    }

    await firestoreAdmin.collection('scheduled_notifications').doc(id).delete();

    return NextResponse.json({
      message: 'Scheduled notification cancelled',
    });
  } catch (error: any) {
    console.error('Error cancelling scheduled notification:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to cancel scheduled notification' },
      { status: 500 }
    );
  }
}


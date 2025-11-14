import { NextRequest, NextResponse } from 'next/server';
import { sendPushNotification, sendBatchPushNotifications } from '@/lib/firebase-admin';
import { firestoreAdmin } from '@/lib/firebase-admin';

// POST /api/notifications/send - Send push notification
export async function POST(req: NextRequest) {
  try {
    const {
      userId,
      userIds, // For batch
      title,
      body,
      data,
      imageUrl,
      type,
    } = await req.json();

    if ((!userId && !userIds) || !title || !body) {
      return NextResponse.json(
        { error: 'userId (or userIds), title, and body are required' },
        { status: 400 }
      );
    }

    // Single user
    if (userId) {
      // Get user's FCM token from Firestore
      const userDoc = await firestoreAdmin.collection('users').doc(userId).get();
      const userData = userDoc.data();

      if (!userData?.fcmToken) {
        return NextResponse.json(
          { error: 'User does not have push notifications enabled' },
          { status: 400 }
        );
      }

      // Send notification
      const result = await sendPushNotification(userData.fcmToken, {
        title,
        body,
        data: {
          ...data,
          type: type || 'general',
        },
        imageUrl,
      });

      // Save to Firestore notifications collection
      await firestoreAdmin.collection('notifications').add({
        userId,
        title,
        body,
        data,
        imageUrl,
        type: type || 'general',
        read: false,
        createdAt: new Date(),
      });

      return NextResponse.json({
        success: true,
        messageId: result.messageId,
        message: 'Notification sent successfully',
      });
    }

    // Batch send
    if (userIds && Array.isArray(userIds)) {
      // Get all users' FCM tokens
      const tokens: string[] = [];
      const validUserIds: string[] = [];

      for (const id of userIds) {
        const userDoc = await firestoreAdmin.collection('users').doc(id).get();
        const userData = userDoc.data();
        if (userData?.fcmToken) {
          tokens.push(userData.fcmToken);
          validUserIds.push(id);
        }
      }

      if (tokens.length === 0) {
        return NextResponse.json(
          { error: 'No valid FCM tokens found' },
          { status: 400 }
        );
      }

      // Send batch notifications
      const result = await sendBatchPushNotifications(tokens, {
        title,
        body,
        data: {
          ...data,
          type: type || 'general',
        },
        imageUrl,
      });

      // Save notifications to Firestore
      const batch = firestoreAdmin.batch();
      validUserIds.forEach((id) => {
        const notifRef = firestoreAdmin.collection('notifications').doc();
        batch.set(notifRef, {
          userId: id,
          title,
          body,
          data,
          imageUrl,
          type: type || 'general',
          read: false,
          createdAt: new Date(),
        });
      });
      await batch.commit();

      return NextResponse.json({
        success: true,
        successCount: result.successCount,
        failureCount: result.failureCount,
        message: `Sent to ${result.successCount}/${tokens.length} devices`,
      });
    }

    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error sending notification:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send notification' },
      { status: 500 }
    );
  }
}


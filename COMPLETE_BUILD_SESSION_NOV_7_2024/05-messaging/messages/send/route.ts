import { NextRequest, NextResponse } from 'next/server';
import { firestoreAdmin } from '@/lib/firebase-admin';
import { sendPushNotification } from '@/lib/firebase-admin';
import { newMessage } from '@/lib/notification-templates';

// POST /api/messages/send - Send message
export async function POST(req: NextRequest) {
  try {
    const {
      conversationId,
      senderId,
      receiverId,
      text,
      imageUrl,
      metadata,
    } = await req.json();

    if (!senderId || !receiverId || (!text && !imageUrl)) {
      return NextResponse.json(
        { error: 'senderId, receiverId, and text/imageUrl are required' },
        { status: 400 }
      );
    }

    // Create or get conversation ID
    const finalConversationId = conversationId || createConversationId(senderId, receiverId);

    // Create message in Firestore
    const messageRef = await firestoreAdmin.collection('messages').add({
      conversationId: finalConversationId,
      senderId,
      receiverId,
      text: text || '',
      imageUrl: imageUrl || null,
      metadata: metadata || null,
      read: false,
      readAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Update conversation last message
    await firestoreAdmin
      .collection('conversations')
      .doc(finalConversationId)
      .set(
        {
          participants: [senderId, receiverId],
          lastMessage: text || 'Image',
          lastMessageAt: new Date(),
          lastSenderId: senderId,
          unreadCount: {
            [receiverId]: firestoreAdmin.FieldValue.increment(1),
          },
          updatedAt: new Date(),
        },
        { merge: true }
      );

    // Get sender info for notification
    const senderDoc = await firestoreAdmin.collection('users').doc(senderId).get();
    const senderData = senderDoc.data();

    // Get receiver's notification preferences
    const receiverDoc = await firestoreAdmin.collection('users').doc(receiverId).get();
    const receiverData = receiverDoc.data();

    // Send push notification if enabled
    const prefs = await firestoreAdmin
      .collection('notification_preferences')
      .doc(receiverId)
      .get();
    const preferences = prefs.data();

    if (
      receiverData?.fcmToken &&
      preferences?.new_message !== false // Default true
    ) {
      const notification = newMessage(
        senderData?.name || 'Someone',
        text || 'Sent an image'
      );

      try {
        await sendPushNotification(receiverData.fcmToken, {
          ...notification,
          data: {
            ...notification.data,
            conversationId: finalConversationId,
            senderId,
          },
        });
      } catch (error) {
        console.error('Failed to send push notification:', error);
        // Don't fail the message send if push fails
      }
    }

    const message = {
      id: messageRef.id,
      conversationId: finalConversationId,
      senderId,
      receiverId,
      text,
      imageUrl,
      metadata,
      read: false,
      createdAt: new Date(),
    };

    return NextResponse.json({
      message,
      success: true,
    });
  } catch (error: any) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send message' },
      { status: 500 }
    );
  }
}

// Helper to create deterministic conversation ID
function createConversationId(userId1: string, userId2: string): string {
  return [userId1, userId2].sort().join('_');
}


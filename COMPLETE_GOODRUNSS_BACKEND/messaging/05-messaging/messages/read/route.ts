import { NextRequest, NextResponse } from 'next/server';
import { firestoreAdmin } from '@/lib/firebase-admin';

// PUT /api/messages/read - Mark messages as read
export async function PUT(req: NextRequest) {
  try {
    const { messageIds, conversationId, userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const batch = firestoreAdmin.batch();

    // Mark specific messages as read
    if (messageIds && Array.isArray(messageIds)) {
      for (const messageId of messageIds) {
        const messageRef = firestoreAdmin.collection('messages').doc(messageId);
        batch.update(messageRef, {
          read: true,
          readAt: new Date(),
        });
      }
    }

    // Mark all messages in conversation as read
    if (conversationId) {
      const messagesSnapshot = await firestoreAdmin
        .collection('messages')
        .where('conversationId', '==', conversationId)
        .where('receiverId', '==', userId)
        .where('read', '==', false)
        .get();

      messagesSnapshot.docs.forEach((doc) => {
        batch.update(doc.ref, {
          read: true,
          readAt: new Date(),
        });
      });

      // Reset unread count for this user in conversation
      const conversationRef = firestoreAdmin
        .collection('conversations')
        .doc(conversationId);
      batch.update(conversationRef, {
        [`unreadCount.${userId}`]: 0,
      });
    }

    await batch.commit();

    return NextResponse.json({
      success: true,
      message: 'Messages marked as read',
    });
  } catch (error: any) {
    console.error('Error marking messages as read:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to mark messages as read' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { firestoreAdmin } from '@/lib/firebase-admin';

// GET /api/messages/thread - Get messages in a conversation
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get('conversationId');
    const userId = searchParams.get('userId');
    const otherUserId = searchParams.get('otherUserId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const before = searchParams.get('before'); // Timestamp for pagination

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Create conversation ID if not provided
    let finalConversationId = conversationId;
    if (!finalConversationId && otherUserId) {
      finalConversationId = [userId, otherUserId].sort().join('_');
    }

    if (!finalConversationId) {
      return NextResponse.json(
        { error: 'conversationId or otherUserId is required' },
        { status: 400 }
      );
    }

    // Get messages
    let query = firestoreAdmin
      .collection('messages')
      .where('conversationId', '==', finalConversationId)
      .orderBy('createdAt', 'desc')
      .limit(limit);

    if (before) {
      query = query.startAfter(new Date(before));
    }

    const messagesSnapshot = await query.get();

    const messages = messagesSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        conversationId: data.conversationId,
        senderId: data.senderId,
        receiverId: data.receiverId,
        text: data.text,
        imageUrl: data.imageUrl,
        metadata: data.metadata,
        read: data.read,
        readAt: data.readAt?.toDate(),
        createdAt: data.createdAt?.toDate(),
      };
    });

    // Get participant info
    const participants = [userId, otherUserId || ''].filter(Boolean);
    const participantDocs = await Promise.all(
      participants.map((id) => firestoreAdmin.collection('users').doc(id).get())
    );

    const participantInfo = participantDocs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data?.name || 'Unknown',
        image: data?.image || null,
      };
    });

    return NextResponse.json({
      messages: messages.reverse(), // Oldest first for display
      conversationId: finalConversationId,
      participants: participantInfo,
      hasMore: messages.length === limit,
    });
  } catch (error: any) {
    console.error('Error fetching message thread:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}


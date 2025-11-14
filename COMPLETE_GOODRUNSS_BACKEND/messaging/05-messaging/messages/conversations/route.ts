import { NextRequest, NextResponse } from 'next/server';
import { firestoreAdmin } from '@/lib/firebase-admin';

// GET /api/messages/conversations - Get user's conversations
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Get conversations where user is a participant
    const conversationsSnapshot = await firestoreAdmin
      .collection('conversations')
      .where('participants', 'array-contains', userId)
      .orderBy('lastMessageAt', 'desc')
      .limit(limit)
      .get();

    const conversations = await Promise.all(
      conversationsSnapshot.docs.map(async (doc) => {
        const data = doc.data();
        
        // Get other participant's info
        const otherParticipantId = data.participants.find((p: string) => p !== userId);
        const userDoc = await firestoreAdmin
          .collection('users')
          .doc(otherParticipantId)
          .get();
        const userData = userDoc.data();

        return {
          id: doc.id,
          conversationId: doc.id,
          otherUser: {
            id: otherParticipantId,
            name: userData?.name || 'Unknown',
            image: userData?.image || null,
          },
          lastMessage: data.lastMessage,
          lastMessageAt: data.lastMessageAt?.toDate(),
          lastSenderId: data.lastSenderId,
          unreadCount: data.unreadCount?.[userId] || 0,
          updatedAt: data.updatedAt?.toDate(),
        };
      })
    );

    return NextResponse.json({
      conversations,
      count: conversations.length,
    });
  } catch (error: any) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}


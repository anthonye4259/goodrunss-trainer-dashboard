import { NextRequest, NextResponse } from 'next/server';
import { firestoreAdmin } from '@/lib/firebase-admin';

// POST /api/messages/block - Block user
export async function POST(req: NextRequest) {
  try {
    const { userId, blockedUserId } = await req.json();

    if (!userId || !blockedUserId) {
      return NextResponse.json(
        { error: 'userId and blockedUserId are required' },
        { status: 400 }
      );
    }

    // Add to blocked users (will be used by safety system)
    await firestoreAdmin
      .collection('blocked_users')
      .doc(`${userId}_${blockedUserId}`)
      .set({
        userId,
        blockedUserId,
        createdAt: new Date(),
      });

    // Update user's blocked list
    await firestoreAdmin
      .collection('users')
      .doc(userId)
      .update({
        blockedUsers: firestoreAdmin.FieldValue.arrayUnion(blockedUserId),
      });

    return NextResponse.json({
      success: true,
      message: 'User blocked',
    });
  } catch (error: any) {
    console.error('Error blocking user:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to block user' },
      { status: 500 }
    );
  }
}

// DELETE /api/messages/block - Unblock user
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const blockedUserId = searchParams.get('blockedUserId');

    if (!userId || !blockedUserId) {
      return NextResponse.json(
        { error: 'userId and blockedUserId are required' },
        { status: 400 }
      );
    }

    // Remove from blocked users
    await firestoreAdmin
      .collection('blocked_users')
      .doc(`${userId}_${blockedUserId}`)
      .delete();

    // Update user's blocked list
    await firestoreAdmin
      .collection('users')
      .doc(userId)
      .update({
        blockedUsers: firestoreAdmin.FieldValue.arrayRemove(blockedUserId),
      });

    return NextResponse.json({
      success: true,
      message: 'User unblocked',
    });
  } catch (error: any) {
    console.error('Error unblocking user:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to unblock user' },
      { status: 500 }
    );
  }
}


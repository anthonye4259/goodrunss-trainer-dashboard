import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { firestoreAdmin } from '@/lib/firebase-admin';

// POST /api/safety/block - Block user
export async function POST(req: NextRequest) {
  try {
    const { userId, blockedUserId, reason } = await req.json();

    if (!userId || !blockedUserId) {
      return NextResponse.json(
        { error: 'userId and blockedUserId are required' },
        { status: 400 }
      );
    }

    // Create block in database
    const block = await prisma.blockedUser.create({
      data: {
        userId,
        blockedUserId,
        reason,
      },
    });

    // Also block in Firebase (for real-time messaging)
    try {
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
    } catch (firebaseError) {
      console.error('Error updating Firebase:', firebaseError);
      // Continue even if Firebase fails
    }

    return NextResponse.json({
      block,
      message: 'User blocked successfully',
    });
  } catch (error: any) {
    console.error('Error blocking user:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to block user' },
      { status: 500 }
    );
  }
}

// DELETE /api/safety/block - Unblock user
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

    // Delete from database
    await prisma.blockedUser.deleteMany({
      where: {
        userId,
        blockedUserId,
      },
    });

    // Also unblock in Firebase
    try {
      await firestoreAdmin
        .collection('blocked_users')
        .doc(`${userId}_${blockedUserId}`)
        .delete();

      await firestoreAdmin
        .collection('users')
        .doc(userId)
        .update({
          blockedUsers: firestoreAdmin.FieldValue.arrayRemove(blockedUserId),
        });
    } catch (firebaseError) {
      console.error('Error updating Firebase:', firebaseError);
    }

    return NextResponse.json({
      message: 'User unblocked successfully',
    });
  } catch (error: any) {
    console.error('Error unblocking user:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to unblock user' },
      { status: 500 }
    );
  }
}

// GET /api/safety/block - Get blocked users
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

    const blockedUsers = await prisma.blockedUser.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      blockedUsers,
      count: blockedUsers.length,
    });
  } catch (error: any) {
    console.error('Error fetching blocked users:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch blocked users' },
      { status: 500 }
    );
  }
}


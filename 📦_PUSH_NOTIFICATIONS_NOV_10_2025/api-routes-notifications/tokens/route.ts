import { NextRequest, NextResponse } from 'next/server';
import { registerFCMToken, removeFCMToken } from '@/lib/firebase-messaging';

/**
 * POST /api/notifications/tokens
 * Register a new FCM token for a user (from consumer app)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, token } = body;

    if (!userId || !token) {
      return NextResponse.json(
        { error: 'userId and token are required' },
        { status: 400 }
      );
    }

    await registerFCMToken(userId, token);

    return NextResponse.json({
      success: true,
      message: 'FCM token registered successfully'
    });
  } catch (error: any) {
    console.error('Error registering FCM token:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to register token' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/notifications/tokens
 * Remove an FCM token for a user (when logging out or uninstalling)
 */
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, token } = body;

    if (!userId || !token) {
      return NextResponse.json(
        { error: 'userId and token are required' },
        { status: 400 }
      );
    }

    await removeFCMToken(userId, token);

    return NextResponse.json({
      success: true,
      message: 'FCM token removed successfully'
    });
  } catch (error: any) {
    console.error('Error removing FCM token:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to remove token' },
      { status: 500 }
    );
  }
}


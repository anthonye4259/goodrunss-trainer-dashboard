import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { sendPushNotification, notificationTemplates } from '@/lib/firebase-messaging';

/**
 * POST /api/notifications/send
 * Send a push notification to a client
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { clientId, type, params } = body;

    if (!clientId || !type) {
      return NextResponse.json(
        { error: 'clientId and type are required' },
        { status: 400 }
      );
    }

    // Get the notification template
    const template = notificationTemplates[type as keyof typeof notificationTemplates];
    
    if (!template) {
      return NextResponse.json(
        { error: `Unknown notification type: ${type}` },
        { status: 400 }
      );
    }

    // Generate notification payload
    const payload = template(params);

    // Send notification
    const result = await sendPushNotification(clientId, payload);

    if (result.success) {
      return NextResponse.json({
        success: true,
        messageId: result.messageId,
        message: 'Notification sent successfully'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Error sending notification:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send notification' },
      { status: 500 }
    );
  }
}

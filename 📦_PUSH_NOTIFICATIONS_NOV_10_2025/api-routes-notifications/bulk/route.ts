import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { sendBulkNotifications, notificationTemplates } from '@/lib/firebase-messaging';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/notifications/bulk
 * Send a push notification to multiple clients
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { clientIds, type, params, recipientType } = body;

    // Get client IDs based on recipient type
    let targetClientIds: string[] = clientIds || [];

    if (recipientType) {
      switch (recipientType) {
        case 'all':
          // Send to all trainer's clients
          const allClients = await prisma.client.findMany({
            where: { trainerId: userId },
            select: { id: true }
          });
          targetClientIds = allClients.map(c => c.id);
          break;

        case 'active':
          // Send to active clients (had session in last 30 days)
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          
          const activeClients = await prisma.client.findMany({
            where: {
              trainerId: userId,
              bookings: {
                some: {
                  startTime: {
                    gte: thirtyDaysAgo
                  },
                  status: 'completed'
                }
              }
            },
            select: { id: true }
          });
          targetClientIds = activeClients.map(c => c.id);
          break;

        case 'upcoming':
          // Send to clients with upcoming sessions
          const upcomingClients = await prisma.client.findMany({
            where: {
              trainerId: userId,
              bookings: {
                some: {
                  startTime: {
                    gte: new Date()
                  },
                  status: 'confirmed'
                }
              }
            },
            select: { id: true }
          });
          targetClientIds = upcomingClients.map(c => c.id);
          break;
      }
    }

    if (targetClientIds.length === 0) {
      return NextResponse.json(
        { error: 'No clients to send notifications to' },
        { status: 400 }
      );
    }

    if (!type) {
      return NextResponse.json(
        { error: 'type is required' },
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

    // Send bulk notifications
    const result = await sendBulkNotifications(targetClientIds, payload);

    return NextResponse.json({
      success: result.success,
      successCount: result.successCount,
      failureCount: result.failureCount,
      totalSent: targetClientIds.length,
      errors: result.errors.length > 0 ? result.errors.slice(0, 10) : undefined
    });
  } catch (error: any) {
    console.error('Error sending bulk notifications:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send bulk notifications' },
      { status: 500 }
    );
  }
}


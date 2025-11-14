import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/waitlist/notify - Trainer notifies waitlist when slot opens
export async function POST(req: NextRequest) {
  try {
    const {
      trainerId,
      availableDate,
      availableSlot,
      maxNotifications = 5,
    } = await req.json();

    if (!trainerId) {
      return NextResponse.json(
        { error: 'trainerId is required' },
        { status: 400 }
      );
    }

    // Get active waitlist entries for this trainer
    const waitlist = await prisma.bookingWaitlist.findMany({
      where: {
        trainerId,
        status: 'active',
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'asc' },
      ],
      take: maxNotifications,
    });

    if (waitlist.length === 0) {
      return NextResponse.json({
        message: 'No active waitlist entries',
        notified: 0,
      });
    }

    const notifications = [];

    // Create notifications for each waitlist entry
    for (const entry of waitlist) {
      // Send email notification
      if (entry.notifyViaEmail) {
        const notification = await prisma.waitlistNotification.create({
          data: {
            waitlistId: entry.id,
            trainerId,
            playerId: entry.playerId,
            notificationType: 'email',
            availableDate: availableDate ? new Date(availableDate) : null,
            availableSlot,
          },
        });
        notifications.push(notification);
      }

      // Send SMS notification
      if (entry.notifyViaSMS && entry.playerPhone) {
        const notification = await prisma.waitlistNotification.create({
          data: {
            waitlistId: entry.id,
            trainerId,
            playerId: entry.playerId,
            notificationType: 'sms',
            availableDate: availableDate ? new Date(availableDate) : null,
            availableSlot,
          },
        });
        notifications.push(notification);
      }

      // Send push notification
      if (entry.notifyViaPush) {
        const notification = await prisma.waitlistNotification.create({
          data: {
            waitlistId: entry.id,
            trainerId,
            playerId: entry.playerId,
            notificationType: 'push',
            availableDate: availableDate ? new Date(availableDate) : null,
            availableSlot,
          },
        });
        notifications.push(notification);
      }

      // Update waitlist entry status
      await prisma.bookingWaitlist.update({
        where: { id: entry.id },
        data: {
          status: 'notified',
          notifiedAt: new Date(),
        },
      });
    }

    return NextResponse.json({
      message: `Notified ${waitlist.length} people on waitlist`,
      notified: waitlist.length,
      notifications,
    });
  } catch (error) {
    console.error('Error notifying waitlist:', error);
    return NextResponse.json(
      { error: 'Failed to notify waitlist' },
      { status: 500 }
    );
  }
}


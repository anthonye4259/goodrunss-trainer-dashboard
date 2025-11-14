/**
 * Scheduled Notifications Service
 * 
 * Allows trainers to schedule notifications to be sent at a future time
 * 
 * Features:
 * - Schedule single or recurring notifications
 * - Cancel scheduled notifications
 * - View upcoming scheduled notifications
 * - Automatic delivery at scheduled time
 */

import { prisma } from "./prisma";
import { sendPushNotification } from "./firebase-messaging";

export interface ScheduledNotificationInput {
  trainerId: string;
  clientId: string;
  type: string;
  params: Record<string, any>;
  scheduledFor: Date;
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    endDate?: Date;
  };
}

/**
 * Schedule a notification to be sent at a specific time
 */
export async function scheduleNotification(input: ScheduledNotificationInput) {
  try {
    // Validate scheduled time is in the future
    if (input.scheduledFor <= new Date()) {
      throw new Error("Scheduled time must be in the future");
    }

    // Create scheduled notification in database
    const scheduled = await prisma.scheduledNotification.create({
      data: {
        trainerId: input.trainerId,
        clientId: input.clientId,
        type: input.type,
        params: input.params as any,
        scheduledFor: input.scheduledFor,
        isRecurring: !!input.recurring,
        recurringFrequency: input.recurring?.frequency,
        recurringEndDate: input.recurring?.endDate,
        status: 'pending',
      },
    });

    console.log(`📅 Notification scheduled for ${input.scheduledFor.toISOString()}`);

    return {
      success: true,
      scheduledNotificationId: scheduled.id,
      scheduledFor: scheduled.scheduledFor,
    };
  } catch (error: any) {
    console.error("❌ Error scheduling notification:", error);
    throw error;
  }
}

/**
 * Cancel a scheduled notification
 */
export async function cancelScheduledNotification(scheduledNotificationId: string) {
  try {
    await prisma.scheduledNotification.update({
      where: { id: scheduledNotificationId },
      data: { 
        status: 'cancelled',
        cancelledAt: new Date(),
      },
    });

    console.log(`🚫 Scheduled notification ${scheduledNotificationId} cancelled`);

    return { success: true };
  } catch (error: any) {
    console.error("❌ Error cancelling scheduled notification:", error);
    throw error;
  }
}

/**
 * Get upcoming scheduled notifications for a trainer
 */
export async function getUpcomingScheduledNotifications(trainerId: string) {
  try {
    const scheduled = await prisma.scheduledNotification.findMany({
      where: {
        trainerId,
        status: 'pending',
        scheduledFor: {
          gte: new Date(),
        },
      },
      orderBy: {
        scheduledFor: 'asc',
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      take: 50,
    });

    return {
      success: true,
      scheduledNotifications: scheduled,
      count: scheduled.length,
    };
  } catch (error: any) {
    console.error("❌ Error fetching scheduled notifications:", error);
    throw error;
  }
}

/**
 * Process due notifications (called by cron job)
 * This should be called every minute by a Vercel cron job
 */
export async function processDueNotifications() {
  try {
    console.log('⏰ Processing due notifications...');

    // Get all pending notifications that are due
    const dueNotifications = await prisma.scheduledNotification.findMany({
      where: {
        status: 'pending',
        scheduledFor: {
          lte: new Date(),
        },
      },
      include: {
        client: true,
        trainer: true,
      },
      take: 100, // Process max 100 at a time
    });

    console.log(`📬 Found ${dueNotifications.length} due notifications`);

    const results = {
      sent: 0,
      failed: 0,
      scheduled: 0,
    };

    // Send each notification
    for (const notification of dueNotifications) {
      try {
        // Send notification
        await sendPushNotification({
          clientId: notification.clientId,
          type: notification.type,
          params: notification.params as any,
        });

        // Update status to sent
        await prisma.scheduledNotification.update({
          where: { id: notification.id },
          data: {
            status: 'sent',
            sentAt: new Date(),
          },
        });

        results.sent++;

        // If recurring, schedule next occurrence
        if (notification.isRecurring && notification.recurringFrequency) {
          const nextDate = calculateNextOccurrence(
            notification.scheduledFor,
            notification.recurringFrequency
          );

          // Check if we should continue recurring
          if (!notification.recurringEndDate || nextDate <= notification.recurringEndDate) {
            await scheduleNotification({
              trainerId: notification.trainerId,
              clientId: notification.clientId,
              type: notification.type,
              params: notification.params as any,
              scheduledFor: nextDate,
              recurring: {
                frequency: notification.recurringFrequency,
                endDate: notification.recurringEndDate || undefined,
              },
            });

            results.scheduled++;
          }
        }
      } catch (error: any) {
        console.error(`❌ Failed to send notification ${notification.id}:`, error);
        
        // Mark as failed
        await prisma.scheduledNotification.update({
          where: { id: notification.id },
          data: {
            status: 'failed',
            error: error.message,
          },
        });

        results.failed++;
      }
    }

    console.log(`✅ Processed ${dueNotifications.length} notifications:`, results);

    return {
      success: true,
      processed: dueNotifications.length,
      results,
    };
  } catch (error: any) {
    console.error("❌ Error processing due notifications:", error);
    throw error;
  }
}

/**
 * Calculate next occurrence for recurring notification
 */
function calculateNextOccurrence(currentDate: Date, frequency: string): Date {
  const next = new Date(currentDate);

  switch (frequency) {
    case 'daily':
      next.setDate(next.getDate() + 1);
      break;
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      break;
  }

  return next;
}

/**
 * Get notification statistics for a trainer
 */
export async function getScheduledNotificationStats(trainerId: string) {
  try {
    const [pending, sent, failed, cancelled] = await Promise.all([
      prisma.scheduledNotification.count({
        where: { trainerId, status: 'pending' },
      }),
      prisma.scheduledNotification.count({
        where: { trainerId, status: 'sent' },
      }),
      prisma.scheduledNotification.count({
        where: { trainerId, status: 'failed' },
      }),
      prisma.scheduledNotification.count({
        where: { trainerId, status: 'cancelled' },
      }),
    ]);

    return {
      success: true,
      stats: {
        pending,
        sent,
        failed,
        cancelled,
        total: pending + sent + failed + cancelled,
      },
    };
  } catch (error: any) {
    console.error("❌ Error fetching notification stats:", error);
    throw error;
  }
}


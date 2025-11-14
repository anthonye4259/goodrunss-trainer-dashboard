// Firebase Cloud Messaging Service
// Send push notifications from Trainer Dashboard to Consumer App

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import { prisma } from '@/lib/prisma';

// Initialize Firebase Admin (if not already initialized)
if (getApps().length === 0) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const messaging = getMessaging();

// ═══════════════════════════════════════════════════════════════
// NOTIFICATION TYPES
// ═══════════════════════════════════════════════════════════════

export type NotificationType = 
  | 'booking_confirmed'
  | 'booking_reminder'
  | 'booking_cancelled'
  | 'booking_rescheduled'
  | 'session_completed'
  | 'message_received'
  | 'workout_plan_ready'
  | 'payment_received'
  | 'payment_due'
  | 'trainer_note'
  | 'promo_offer';

export interface NotificationPayload {
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
  actionUrl?: string;
}

// ═══════════════════════════════════════════════════════════════
// SEND NOTIFICATION TO USER
// ═══════════════════════════════════════════════════════════════

export async function sendPushNotification(
  userId: string,
  payload: NotificationPayload
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    // Get user's FCM tokens from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { fcmTokens: true }
    });

    if (!user || !user.fcmTokens || (user.fcmTokens as any).length === 0) {
      return {
        success: false,
        error: 'User has no FCM tokens registered'
      };
    }

    const tokens = user.fcmTokens as string[];

    // Check user notification preferences
    const preferences = await prisma.notificationPreference.findUnique({
      where: { userId }
    });

    // Check if this notification type is enabled
    if (preferences) {
      const prefKey = `${payload.type}Enabled` as keyof typeof preferences;
      if (preferences[prefKey] === false) {
        return {
          success: false,
          error: 'User has disabled this notification type'
        };
      }
    }

    // Prepare FCM message
    const message = {
      notification: {
        title: payload.title,
        body: payload.body,
        imageUrl: payload.imageUrl,
      },
      data: {
        type: payload.type,
        ...(payload.data || {}),
        ...(payload.actionUrl ? { actionUrl: payload.actionUrl } : {}),
      },
      tokens,
      android: {
        priority: 'high' as const,
        notification: {
          sound: 'default',
          clickAction: 'FLUTTER_NOTIFICATION_CLICK',
          channelId: 'goodrunss_notifications',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
            contentAvailable: true,
          },
        },
      },
    };

    // Send via FCM
    const response = await messaging.sendEachForMulticast(message);

    // Handle results
    const successCount = response.successCount;
    const failureCount = response.failureCount;

    // Remove invalid tokens
    if (failureCount > 0) {
      const invalidTokens: string[] = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          invalidTokens.push(tokens[idx]);
        }
      });

      if (invalidTokens.length > 0) {
        // Remove invalid tokens from database
        const validTokens = tokens.filter(t => !invalidTokens.includes(t));
        await prisma.user.update({
          where: { id: userId },
          data: { fcmTokens: validTokens }
        });
      }
    }

    // Save notification to database for history
    await prisma.notification.create({
      data: {
        userId,
        type: payload.type,
        title: payload.title,
        body: payload.body,
        data: payload.data ? JSON.parse(JSON.stringify(payload.data)) : null,
        sentAt: new Date(),
        deliveryStatus: successCount > 0 ? 'delivered' : 'failed'
      }
    });

    return {
      success: successCount > 0,
      messageId: response.responses[0]?.messageId,
    };
  } catch (error: any) {
    console.error('Error sending push notification:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// SEND TO MULTIPLE USERS
// ═══════════════════════════════════════════════════════════════

export async function sendBulkNotifications(
  userIds: string[],
  payload: NotificationPayload
): Promise<{
  success: boolean;
  successCount: number;
  failureCount: number;
  errors: string[];
}> {
  const results = await Promise.allSettled(
    userIds.map(userId => sendPushNotification(userId, payload))
  );

  let successCount = 0;
  let failureCount = 0;
  const errors: string[] = [];

  results.forEach((result, idx) => {
    if (result.status === 'fulfilled' && result.value.success) {
      successCount++;
    } else {
      failureCount++;
      const error = result.status === 'rejected' 
        ? result.reason 
        : result.value.error;
      errors.push(`User ${userIds[idx]}: ${error}`);
    }
  });

  return {
    success: successCount > 0,
    successCount,
    failureCount,
    errors
  };
}

// ═══════════════════════════════════════════════════════════════
// NOTIFICATION TEMPLATES
// ═══════════════════════════════════════════════════════════════

export const notificationTemplates = {
  // Booking Confirmed
  bookingConfirmed: (params: {
    trainerName: string;
    date: string;
    time: string;
    location: string;
  }): NotificationPayload => ({
    type: 'booking_confirmed',
    title: '✅ Session Confirmed!',
    body: `Your session with ${params.trainerName} is confirmed for ${params.date} at ${params.time}`,
    data: {
      trainerName: params.trainerName,
      date: params.date,
      time: params.time,
      location: params.location,
    },
    actionUrl: '/bookings',
  }),

  // Booking Reminder (24 hours before)
  bookingReminder: (params: {
    trainerName: string;
    time: string;
    location: string;
  }): NotificationPayload => ({
    type: 'booking_reminder',
    title: '🔔 Session Tomorrow',
    body: `Don't forget! You have a session with ${params.trainerName} tomorrow at ${params.time}`,
    data: {
      trainerName: params.trainerName,
      time: params.time,
      location: params.location,
    },
    actionUrl: '/bookings',
  }),

  // Booking Cancelled
  bookingCancelled: (params: {
    trainerName: string;
    date: string;
    reason?: string;
  }): NotificationPayload => ({
    type: 'booking_cancelled',
    title: '❌ Session Cancelled',
    body: `Your session with ${params.trainerName} on ${params.date} has been cancelled${params.reason ? `: ${params.reason}` : ''}`,
    data: {
      trainerName: params.trainerName,
      date: params.date,
    },
    actionUrl: '/bookings',
  }),

  // Booking Rescheduled
  bookingRescheduled: (params: {
    trainerName: string;
    oldDate: string;
    newDate: string;
    newTime: string;
  }): NotificationPayload => ({
    type: 'booking_rescheduled',
    title: '📅 Session Rescheduled',
    body: `Your session with ${params.trainerName} has been moved to ${params.newDate} at ${params.newTime}`,
    data: {
      trainerName: params.trainerName,
      oldDate: params.oldDate,
      newDate: params.newDate,
      newTime: params.newTime,
    },
    actionUrl: '/bookings',
  }),

  // Session Completed
  sessionCompleted: (params: {
    trainerName: string;
    sessionType: string;
  }): NotificationPayload => ({
    type: 'session_completed',
    title: '🎉 Session Complete!',
    body: `Great job! Your ${params.sessionType} session with ${params.trainerName} is complete`,
    data: {
      trainerName: params.trainerName,
      sessionType: params.sessionType,
    },
    actionUrl: '/progress',
  }),

  // New Message
  messageReceived: (params: {
    senderName: string;
    preview: string;
  }): NotificationPayload => ({
    type: 'message_received',
    title: `💬 ${params.senderName}`,
    body: params.preview,
    data: {
      senderName: params.senderName,
    },
    actionUrl: '/messages',
  }),

  // Workout Plan Ready
  workoutPlanReady: (params: {
    trainerName: string;
    planName: string;
  }): NotificationPayload => ({
    type: 'workout_plan_ready',
    title: '💪 New Workout Plan',
    body: `${params.trainerName} has created a new workout plan for you: ${params.planName}`,
    data: {
      trainerName: params.trainerName,
      planName: params.planName,
    },
    actionUrl: '/workouts',
  }),

  // Payment Received
  paymentReceived: (params: {
    amount: number;
    sessionType: string;
  }): NotificationPayload => ({
    type: 'payment_received',
    title: '✅ Payment Confirmed',
    body: `Your payment of $${params.amount.toFixed(2)} for ${params.sessionType} has been received`,
    data: {
      amount: params.amount.toString(),
      sessionType: params.sessionType,
    },
    actionUrl: '/payments',
  }),

  // Payment Due
  paymentDue: (params: {
    amount: number;
    dueDate: string;
  }): NotificationPayload => ({
    type: 'payment_due',
    title: '💳 Payment Due',
    body: `You have a payment of $${params.amount.toFixed(2)} due on ${params.dueDate}`,
    data: {
      amount: params.amount.toString(),
      dueDate: params.dueDate,
    },
    actionUrl: '/payments',
  }),

  // Trainer Note
  trainerNote: (params: {
    trainerName: string;
    note: string;
  }): NotificationPayload => ({
    type: 'trainer_note',
    title: `📝 Note from ${params.trainerName}`,
    body: params.note,
    data: {
      trainerName: params.trainerName,
    },
    actionUrl: '/messages',
  }),

  // Promo Offer
  promoOffer: (params: {
    title: string;
    description: string;
  }): NotificationPayload => ({
    type: 'promo_offer',
    title: `🎁 ${params.title}`,
    body: params.description,
    data: {},
    actionUrl: '/offers',
  }),
};

// ═══════════════════════════════════════════════════════════════
// HELPER: Register/Update FCM Token
// ═══════════════════════════════════════════════════════════════

export async function registerFCMToken(
  userId: string,
  token: string
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { fcmTokens: true }
  });

  const currentTokens = (user?.fcmTokens as string[]) || [];
  
  // Add token if not already present
  if (!currentTokens.includes(token)) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        fcmTokens: [...currentTokens, token]
      }
    });
  }
}

// ═══════════════════════════════════════════════════════════════
// HELPER: Remove FCM Token
// ═══════════════════════════════════════════════════════════════

export async function removeFCMToken(
  userId: string,
  token: string
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { fcmTokens: true }
  });

  const currentTokens = (user?.fcmTokens as string[]) || [];
  
  await prisma.user.update({
    where: { id: userId },
    data: {
      fcmTokens: currentTokens.filter(t => t !== token)
    }
  });
}

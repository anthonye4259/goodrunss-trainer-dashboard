/**
 * 🔄 REAL-TIME UPDATES SYSTEM
 * 
 * Server-Sent Events (SSE) for real-time updates
 * - Booking status changes
 * - Waitlist position updates
 * - Availability changes
 * - Payment confirmations
 * 
 * Fallback to polling for older browsers
 */

import { prisma } from '@/lib/prisma';

export type UpdateType = 
  | 'booking_status'
  | 'waitlist_position'
  | 'availability_changed'
  | 'payment_confirmed'
  | 'new_message'
  | 'booking_reminder';

export interface RealtimeUpdate {
  id: string;
  type: UpdateType;
  userId: string;
  data: any;
  timestamp: Date;
}

// In-memory store for updates (in production, use Redis)
const updateQueues = new Map<string, RealtimeUpdate[]>();

/**
 * Queue an update for a user
 */
export async function queueUpdate(update: Omit<RealtimeUpdate, 'id' | 'timestamp'>) {
  const fullUpdate: RealtimeUpdate = {
    ...update,
    id: `update_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(),
  };

  // Get or create queue for user
  const queue = updateQueues.get(update.userId) || [];
  queue.push(fullUpdate);
  updateQueues.set(update.userId, queue);

  // Also save to database for persistence
  try {
    await prisma.$executeRawUnsafe(
      `INSERT INTO realtime_updates (id, type, user_id, data, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      fullUpdate.id,
      update.type,
      update.userId,
      JSON.stringify(update.data)
    );
  } catch (error) {
    console.error('Failed to persist realtime update:', error);
  }

  // Clean old updates (keep last 100)
  if (queue.length > 100) {
    updateQueues.set(update.userId, queue.slice(-100));
  }

  return fullUpdate;
}

/**
 * Get pending updates for a user
 */
export function getPendingUpdates(userId: string, since?: Date): RealtimeUpdate[] {
  const queue = updateQueues.get(userId) || [];
  
  if (since) {
    return queue.filter(update => update.timestamp > since);
  }
  
  return queue;
}

/**
 * Clear updates for a user (after they've been consumed)
 */
export function clearUpdates(userId: string, beforeId?: string) {
  if (!beforeId) {
    updateQueues.delete(userId);
    return;
  }

  const queue = updateQueues.get(userId) || [];
  const index = queue.findIndex(u => u.id === beforeId);
  
  if (index !== -1) {
    updateQueues.set(userId, queue.slice(index + 1));
  }
}

/**
 * Helper functions to queue specific update types
 */
export const updates = {
  /**
   * Notify user about booking status change
   */
  bookingStatus: async (params: {
    userId: string;
    bookingId: string;
    status: string;
    trainerName?: string;
    scheduledAt?: Date;
  }) => {
    return queueUpdate({
      type: 'booking_status',
      userId: params.userId,
      data: {
        bookingId: params.bookingId,
        status: params.status,
        trainerName: params.trainerName,
        scheduledAt: params.scheduledAt,
        message: getStatusMessage(params.status, params.trainerName),
      },
    });
  },

  /**
   * Notify user about waitlist position change
   */
  waitlistPosition: async (params: {
    userId: string;
    waitlistId: string;
    position: number;
    totalAhead: number;
    spotAvailable?: boolean;
  }) => {
    return queueUpdate({
      type: 'waitlist_position',
      userId: params.userId,
      data: {
        waitlistId: params.waitlistId,
        position: params.position,
        totalAhead: params.totalAhead,
        spotAvailable: params.spotAvailable,
        message: params.spotAvailable
          ? '🎉 A spot just opened up!'
          : `You're #${params.position} in line`,
      },
    });
  },

  /**
   * Notify user about availability changes
   */
  availabilityChanged: async (params: {
    userId: string;
    trainerId?: string;
    facilityId?: string;
    date: string;
    newSlots: number;
  }) => {
    return queueUpdate({
      type: 'availability_changed',
      userId: params.userId,
      data: {
        trainerId: params.trainerId,
        facilityId: params.facilityId,
        date: params.date,
        newSlots: params.newSlots,
        message: `${params.newSlots} new time slots available for ${params.date}`,
      },
    });
  },

  /**
   * Notify user about payment confirmation
   */
  paymentConfirmed: async (params: {
    userId: string;
    bookingId: string;
    amount: number;
    currency: string;
  }) => {
    return queueUpdate({
      type: 'payment_confirmed',
      userId: params.userId,
      data: {
        bookingId: params.bookingId,
        amount: params.amount,
        currency: params.currency,
        message: `Payment of ${params.currency.toUpperCase()} ${params.amount} confirmed`,
      },
    });
  },

  /**
   * Notify user about new message
   */
  newMessage: async (params: {
    userId: string;
    conversationId: string;
    senderName: string;
    preview: string;
  }) => {
    return queueUpdate({
      type: 'new_message',
      userId: params.userId,
      data: {
        conversationId: params.conversationId,
        senderName: params.senderName,
        preview: params.preview,
        message: `${params.senderName}: ${params.preview}`,
      },
    });
  },
};

/**
 * Get user-friendly status message
 */
function getStatusMessage(status: string, trainerName?: string): string {
  switch (status.toLowerCase()) {
    case 'confirmed':
      return trainerName 
        ? `${trainerName} confirmed your booking!` 
        : 'Your booking is confirmed!';
    case 'completed':
      return 'Session completed! How was it?';
    case 'cancelled':
      return 'Booking was cancelled';
    case 'pending':
      return 'Waiting for confirmation...';
    default:
      return `Booking status: ${status}`;
  }
}


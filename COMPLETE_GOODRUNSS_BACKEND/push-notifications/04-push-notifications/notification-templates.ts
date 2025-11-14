/**
 * Notification Templates
 * 
 * Pre-defined notification templates for different events
 */

export interface NotificationTemplate {
  title: string;
  body: string;
  type: string;
  data?: { [key: string]: string };
}

// Booking notifications
export const bookingConfirmed = (
  trainerName: string,
  date: string,
  time: string
): NotificationTemplate => ({
  title: '✅ Booking Confirmed',
  body: `Your session with ${trainerName} is confirmed for ${date} at ${time}`,
  type: 'booking_confirmed',
  data: {
    action: 'open_booking',
  },
});

export const bookingReminder24h = (
  trainerName: string,
  time: string
): NotificationTemplate => ({
  title: '⏰ Session Tomorrow',
  body: `Reminder: You have a session with ${trainerName} tomorrow at ${time}`,
  type: 'booking_reminder',
  data: {
    action: 'open_booking',
  },
});

export const bookingReminder1h = (
  trainerName: string,
  time: string
): NotificationTemplate => ({
  title: '⏰ Session Starting Soon',
  body: `Your session with ${trainerName} starts in 1 hour at ${time}`,
  type: 'booking_reminder',
  data: {
    action: 'open_booking',
  },
});

export const bookingCancelled = (
  trainerName: string,
  date: string
): NotificationTemplate => ({
  title: '❌ Session Cancelled',
  body: `Your session with ${trainerName} on ${date} has been cancelled`,
  type: 'booking_cancelled',
  data: {
    action: 'open_bookings',
  },
});

// Waitlist notifications
export const waitlistAvailable = (
  trainerName: string,
  date: string,
  time: string
): NotificationTemplate => ({
  title: '🎉 Spot Available!',
  body: `A spot opened up with ${trainerName} on ${date} at ${time}. Book now!`,
  type: 'waitlist_available',
  data: {
    action: 'open_waitlist',
  },
});

// Message notifications
export const newMessage = (senderName: string, preview: string): NotificationTemplate => ({
  title: `💬 New message from ${senderName}`,
  body: preview,
  type: 'new_message',
  data: {
    action: 'open_messages',
  },
});

// Payment notifications
export const paymentConfirmed = (amount: string): NotificationTemplate => ({
  title: '💳 Payment Confirmed',
  body: `Your payment of ${amount} has been processed successfully`,
  type: 'payment_confirmed',
  data: {
    action: 'open_payments',
  },
});

export const paymentRefunded = (amount: string): NotificationTemplate => ({
  title: '💰 Refund Processed',
  body: `Your refund of ${amount} has been processed`,
  type: 'payment_refunded',
  data: {
    action: 'open_payments',
  },
});

// Review notifications
export const newReview = (clientName: string, rating: number): NotificationTemplate => ({
  title: '⭐ New Review',
  body: `${clientName} left you a ${rating}-star review`,
  type: 'review_received',
  data: {
    action: 'open_reviews',
  },
});

export const trainerResponse = (trainerName: string): NotificationTemplate => ({
  title: '💬 Trainer Responded',
  body: `${trainerName} responded to your review`,
  type: 'trainer_response',
  data: {
    action: 'open_reviews',
  },
});

// AI Persona notifications
export const aiPersonaReady = (personaName: string): NotificationTemplate => ({
  title: '🤖 AI Trainer Ready',
  body: `Your AI trainer clone "${personaName}" is now live!`,
  type: 'ai_persona_ready',
  data: {
    action: 'open_ai_personas',
  },
});

// General notifications
export const welcome = (userName: string): NotificationTemplate => ({
  title: `👋 Welcome to GoodRunss, ${userName}!`,
  body: 'Find your perfect trainer and start your fitness journey today',
  type: 'welcome',
  data: {
    action: 'open_home',
  },
});


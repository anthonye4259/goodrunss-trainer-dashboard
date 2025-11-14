/**
 * GoodRunss Analytics Tracker
 * Universal event tracking library for product insights
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// =====================================================
// TYPE DEFINITIONS
// =====================================================

export interface TrackEventOptions {
  eventName: string;
  eventCategory?: string;
  userId?: string;
  sessionId?: string;
  anonymousId?: string;
  properties?: Record<string, any>;
  context?: {
    deviceType?: 'mobile' | 'tablet' | 'desktop';
    platform?: 'ios' | 'android' | 'web';
    appVersion?: string;
    osVersion?: string;
    ipAddress?: string;
    country?: string;
    city?: string;
    utm?: {
      source?: string;
      medium?: string;
      campaign?: string;
      content?: string;
      term?: string;
    };
    referrer?: string;
  };
}

export interface SessionOptions {
  userId?: string;
  anonymousId?: string;
  deviceType?: string;
  platform?: string;
  browser?: string;
  entryPage?: string;
  country?: string;
  city?: string;
}

// =====================================================
// CORE TRACKING FUNCTIONS
// =====================================================

/**
 * Track an event
 * Universal function to log any user action
 */
export async function trackEvent(options: TrackEventOptions): Promise<void> {
  try {
    const {
      eventName,
      eventCategory,
      userId,
      sessionId,
      anonymousId,
      properties = {},
      context = {},
    } = options;

    // Insert event into database
    const { error } = await supabase.from('analytics_events').insert({
      event_name: eventName,
      event_category: eventCategory,
      user_id: userId || null,
      session_id: sessionId || null,
      anonymous_id: anonymousId || null,
      properties,
      device_type: context.deviceType,
      platform: context.platform,
      app_version: context.appVersion,
      os_version: context.osVersion,
      ip_address: context.ipAddress,
      country: context.country,
      city: context.city,
      utm_source: context.utm?.source,
      utm_medium: context.utm?.medium,
      utm_campaign: context.utm?.campaign,
      utm_content: context.utm?.content,
      utm_term: context.utm?.term,
      referrer: context.referrer,
    });

    if (error) {
      console.error('Failed to track event:', error);
    }

    // Also log to console in dev
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Analytics Event:', eventName, properties);
    }
  } catch (error) {
    console.error('Error tracking event:', error);
  }
}

/**
 * Start a user session
 * Call this when user opens app or starts browsing
 */
export async function startSession(options: SessionOptions): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('analytics_sessions')
      .insert({
        user_id: options.userId || null,
        anonymous_id: options.anonymousId || null,
        started_at: new Date().toISOString(),
        device_type: options.deviceType,
        platform: options.platform,
        browser: options.browser,
        entry_page: options.entryPage,
        country: options.country,
        city: options.city,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Failed to start session:', error);
      return null;
    }

    return data.id;
  } catch (error) {
    console.error('Error starting session:', error);
    return null;
  }
}

/**
 * End a user session
 * Call this when user closes app or leaves site
 */
export async function endSession(sessionId: string, exitPage?: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('analytics_sessions')
      .update({
        ended_at: new Date().toISOString(),
        exit_page: exitPage,
      })
      .eq('id', sessionId);

    if (error) {
      console.error('Failed to end session:', error);
    }
  } catch (error) {
    console.error('Error ending session:', error);
  }
}

/**
 * Increment page view count in session
 */
export async function trackPageView(sessionId: string, page: string): Promise<void> {
  try {
    const { error } = await supabase.rpc('increment_page_views', {
      p_session_id: sessionId,
    });

    if (error) {
      console.error('Failed to track page view:', error);
    }
  } catch (error) {
    console.error('Error tracking page view:', error);
  }
}

// =====================================================
// PRESET EVENT TRACKERS
// =====================================================

/**
 * Track user signup events
 */
export const SignupEvents = {
  started: (method: 'email' | 'google' | 'apple', sessionId?: string) =>
    trackEvent({
      eventName: 'signup_started',
      eventCategory: 'user',
      sessionId,
      properties: { method },
    }),

  completed: (userId: string, method: string, sessionId?: string) =>
    trackEvent({
      eventName: 'signup_completed',
      eventCategory: 'user',
      userId,
      sessionId,
      properties: { method },
    }),

  failed: (method: string, error: string, sessionId?: string) =>
    trackEvent({
      eventName: 'signup_failed',
      eventCategory: 'user',
      sessionId,
      properties: { method, error },
    }),
};

/**
 * Track booking events
 */
export const BookingEvents = {
  searchStarted: (sport?: string, location?: string, userId?: string, sessionId?: string) =>
    trackEvent({
      eventName: 'booking_search_started',
      eventCategory: 'booking',
      userId,
      sessionId,
      properties: { sport, location },
    }),

  facilityViewed: (facilityId: string, facilityName: string, userId?: string, sessionId?: string) =>
    trackEvent({
      eventName: 'facility_viewed',
      eventCategory: 'booking',
      userId,
      sessionId,
      properties: { facility_id: facilityId, facility_name: facilityName },
    }),

  flowStarted: (facilityId: string, resourceId: string, userId?: string, sessionId?: string) =>
    trackEvent({
      eventName: 'booking_flow_started',
      eventCategory: 'booking',
      userId,
      sessionId,
      properties: { facility_id: facilityId, resource_id: resourceId },
    }),

  created: (bookingId: string, amountCents: number, sport: string, userId?: string, sessionId?: string) =>
    trackEvent({
      eventName: 'booking_created',
      eventCategory: 'booking',
      userId,
      sessionId,
      properties: { booking_id: bookingId, amount_cents: amountCents, sport },
    }),

  completed: (bookingId: string, paymentMethod: string, userId?: string, sessionId?: string) =>
    trackEvent({
      eventName: 'booking_completed',
      eventCategory: 'booking',
      userId,
      sessionId,
      properties: { booking_id: bookingId, payment_method: paymentMethod },
    }),

  cancelled: (bookingId: string, reason?: string, userId?: string, sessionId?: string) =>
    trackEvent({
      eventName: 'booking_cancelled',
      eventCategory: 'booking',
      userId,
      sessionId,
      properties: { booking_id: bookingId, reason },
    }),
};

/**
 * Track social events
 */
export const SocialEvents = {
  friendRequestSent: (toUserId: string, userId: string, sessionId?: string) =>
    trackEvent({
      eventName: 'friend_request_sent',
      eventCategory: 'social',
      userId,
      sessionId,
      properties: { to_user_id: toUserId },
    }),

  friendRequestAccepted: (fromUserId: string, userId: string, sessionId?: string) =>
    trackEvent({
      eventName: 'friend_request_accepted',
      eventCategory: 'social',
      userId,
      sessionId,
      properties: { from_user_id: fromUserId },
    }),

  groupCreated: (groupId: string, memberCount: number, userId: string, sessionId?: string) =>
    trackEvent({
      eventName: 'group_created',
      eventCategory: 'social',
      userId,
      sessionId,
      properties: { group_id: groupId, member_count: memberCount },
    }),

  messageSent: (conversationId: string, type: string, userId: string, sessionId?: string) =>
    trackEvent({
      eventName: 'message_sent',
      eventCategory: 'social',
      userId,
      sessionId,
      properties: { conversation_id: conversationId, type },
    }),

  matchRequestSent: (toUserId: string, sport: string, userId: string, sessionId?: string) =>
    trackEvent({
      eventName: 'match_request_sent',
      eventCategory: 'social',
      userId,
      sessionId,
      properties: { to_user_id: toUserId, sport },
    }),
};

/**
 * Track payment events
 */
export const PaymentEvents = {
  methodAdded: (type: 'card' | 'apple_pay' | 'google_pay', userId: string, sessionId?: string) =>
    trackEvent({
      eventName: 'payment_method_added',
      eventCategory: 'payment',
      userId,
      sessionId,
      properties: { type },
    }),

  initiated: (amountCents: number, userId: string, sessionId?: string) =>
    trackEvent({
      eventName: 'payment_initiated',
      eventCategory: 'payment',
      userId,
      sessionId,
      properties: { amount_cents: amountCents },
    }),

  completed: (amountCents: number, paymentId: string, userId: string, sessionId?: string) =>
    trackEvent({
      eventName: 'payment_completed',
      eventCategory: 'payment',
      userId,
      sessionId,
      properties: { amount_cents: amountCents, payment_id: paymentId },
    }),

  failed: (amountCents: number, error: string, userId: string, sessionId?: string) =>
    trackEvent({
      eventName: 'payment_failed',
      eventCategory: 'payment',
      userId,
      sessionId,
      properties: { amount_cents: amountCents, error },
    }),
};

/**
 * Track engagement events
 */
export const EngagementEvents = {
  appOpened: (userId?: string, sessionId?: string) =>
    trackEvent({
      eventName: 'app_opened',
      eventCategory: 'engagement',
      userId,
      sessionId,
    }),

  pageViewed: (page: string, path: string, userId?: string, sessionId?: string) =>
    trackEvent({
      eventName: 'page_viewed',
      eventCategory: 'engagement',
      userId,
      sessionId,
      properties: { page, path },
    }),

  featureUsed: (featureName: string, userId?: string, sessionId?: string) =>
    trackEvent({
      eventName: 'feature_used',
      eventCategory: 'engagement',
      userId,
      sessionId,
      properties: { feature_name: featureName },
    }),

  searchPerformed: (query: string, resultsCount: number, userId?: string, sessionId?: string) =>
    trackEvent({
      eventName: 'search_performed',
      eventCategory: 'engagement',
      userId,
      sessionId,
      properties: { query, results_count: resultsCount },
    }),

  notificationClicked: (type: string, userId: string, sessionId?: string) =>
    trackEvent({
      eventName: 'notification_clicked',
      eventCategory: 'engagement',
      userId,
      sessionId,
      properties: { type },
    }),
};

/**
 * Track growth events
 */
export const GrowthEvents = {
  referralShared: (method: 'instagram' | 'twitter' | 'facebook' | 'copy', userId: string, sessionId?: string) =>
    trackEvent({
      eventName: 'referral_shared',
      eventCategory: 'growth',
      userId,
      sessionId,
      properties: { method },
    }),

  referralSignup: (referrerId: string, userId: string, sessionId?: string) =>
    trackEvent({
      eventName: 'referral_signup',
      eventCategory: 'growth',
      userId,
      sessionId,
      properties: { referrer_id: referrerId },
    }),

  achievementShared: (type: string, value: any, userId: string, sessionId?: string) =>
    trackEvent({
      eventName: 'achievement_shared',
      eventCategory: 'growth',
      userId,
      sessionId,
      properties: { type, value },
    }),
};

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Generate anonymous ID for pre-signup tracking
 */
export function generateAnonymousId(): string {
  return `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get device type from user agent
 */
export function getDeviceType(userAgent: string): 'mobile' | 'tablet' | 'desktop' {
  if (/mobile/i.test(userAgent)) return 'mobile';
  if (/tablet|ipad/i.test(userAgent)) return 'tablet';
  return 'desktop';
}

/**
 * Get platform from user agent
 */
export function getPlatform(userAgent: string): 'ios' | 'android' | 'web' {
  if (/iPhone|iPad|iPod/i.test(userAgent)) return 'ios';
  if (/Android/i.test(userAgent)) return 'android';
  return 'web';
}

/**
 * Extract UTM parameters from URL
 */
export function extractUTMParams(url: string): {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
} {
  const urlObj = new URL(url);
  return {
    source: urlObj.searchParams.get('utm_source') || undefined,
    medium: urlObj.searchParams.get('utm_medium') || undefined,
    campaign: urlObj.searchParams.get('utm_campaign') || undefined,
    content: urlObj.searchParams.get('utm_content') || undefined,
    term: urlObj.searchParams.get('utm_term') || undefined,
  };
}


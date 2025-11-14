/**
 * Preset Analytics Tracking
 * Auto-tracking helpers that can be called from API routes
 */

import { SignupEvents, BookingEvents, SocialEvents, PaymentEvents, EngagementEvents, GrowthEvents } from './analytics-tracker';

// =====================================================
// AUTO-TRACKING WRAPPERS
// =====================================================

/**
 * Track user signup flow
 * Call these from your auth API routes
 */
export const trackSignupFlow = {
  /**
   * When user clicks "Sign Up" button or navigates to signup page
   */
  started: (method: 'email' | 'google' | 'apple', sessionId?: string) => {
    return SignupEvents.started(method, sessionId);
  },

  /**
   * When user successfully completes signup
   * Call this after user is created in database
   */
  completed: (userId: string, method: string, sessionId?: string) => {
    return SignupEvents.completed(userId, method, sessionId);
  },

  /**
   * When signup fails (email already exists, invalid data, etc.)
   */
  failed: (method: string, error: string, sessionId?: string) => {
    return SignupEvents.failed(method, error, sessionId);
  },
};

/**
 * Track booking flow
 * Call these from your booking API routes
 */
export const trackBookingFlow = {
  /**
   * When user opens search/browse page
   */
  searchStarted: (sport?: string, location?: string, userId?: string, sessionId?: string) => {
    return BookingEvents.searchStarted(sport, location, userId, sessionId);
  },

  /**
   * When user clicks on a facility to view details
   */
  facilityViewed: (facilityId: string, facilityName: string, userId?: string, sessionId?: string) => {
    return BookingEvents.facilityViewed(facilityId, facilityName, userId, sessionId);
  },

  /**
   * When user clicks "Book" button and enters booking flow
   */
  flowStarted: (facilityId: string, resourceId: string, userId?: string, sessionId?: string) => {
    return BookingEvents.flowStarted(facilityId, resourceId, userId, sessionId);
  },

  /**
   * When booking is created in database (before payment)
   */
  created: (bookingId: string, amountCents: number, sport: string, userId?: string, sessionId?: string) => {
    return BookingEvents.created(bookingId, amountCents, sport, userId, sessionId);
  },

  /**
   * When payment completes and booking is confirmed
   */
  completed: (bookingId: string, paymentMethod: string, userId?: string, sessionId?: string) => {
    return BookingEvents.completed(bookingId, paymentMethod, sessionId);
  },

  /**
   * When user cancels a booking
   */
  cancelled: (bookingId: string, reason?: string, userId?: string, sessionId?: string) => {
    return BookingEvents.cancelled(bookingId, reason, userId, sessionId);
  },
};

/**
 * Track social interactions
 * Call these from your social API routes
 */
export const trackSocialFlow = {
  /**
   * When user sends friend request
   */
  friendRequestSent: (toUserId: string, userId: string, sessionId?: string) => {
    return SocialEvents.friendRequestSent(toUserId, userId, sessionId);
  },

  /**
   * When user accepts friend request
   */
  friendRequestAccepted: (fromUserId: string, userId: string, sessionId?: string) => {
    return SocialEvents.friendRequestAccepted(fromUserId, userId, sessionId);
  },

  /**
   * When user creates a group/squad
   */
  groupCreated: (groupId: string, memberCount: number, userId: string, sessionId?: string) => {
    return SocialEvents.groupCreated(groupId, memberCount, userId, sessionId);
  },

  /**
   * When user sends a message
   */
  messageSent: (conversationId: string, type: string, userId: string, sessionId?: string) => {
    return SocialEvents.messageSent(conversationId, type, userId, sessionId);
  },

  /**
   * When user sends match request
   */
  matchRequestSent: (toUserId: string, sport: string, userId: string, sessionId?: string) => {
    return SocialEvents.matchRequestSent(toUserId, sport, userId, sessionId);
  },
};

/**
 * Track payment flow
 * Call these from your Stripe webhook handlers
 */
export const trackPaymentFlow = {
  /**
   * When user adds payment method
   */
  methodAdded: (type: 'card' | 'apple_pay' | 'google_pay', userId: string, sessionId?: string) => {
    return PaymentEvents.methodAdded(type, userId, sessionId);
  },

  /**
   * When payment is initiated (Stripe session created)
   */
  initiated: (amountCents: number, userId: string, sessionId?: string) => {
    return PaymentEvents.initiated(amountCents, userId, sessionId);
  },

  /**
   * When payment successfully completes
   */
  completed: (amountCents: number, paymentId: string, userId: string, sessionId?: string) => {
    return PaymentEvents.completed(amountCents, paymentId, userId, sessionId);
  },

  /**
   * When payment fails
   */
  failed: (amountCents: number, error: string, userId: string, sessionId?: string) => {
    return PaymentEvents.failed(amountCents, error, userId, sessionId);
  },
};

/**
 * Track engagement
 * Call these from your page components or API routes
 */
export const trackEngagement = {
  /**
   * When user opens the app
   */
  appOpened: (userId?: string, sessionId?: string) => {
    return EngagementEvents.appOpened(userId, sessionId);
  },

  /**
   * When user views a page
   */
  pageViewed: (page: string, path: string, userId?: string, sessionId?: string) => {
    return EngagementEvents.pageViewed(page, path, userId, sessionId);
  },

  /**
   * When user uses a specific feature
   */
  featureUsed: (featureName: string, userId?: string, sessionId?: string) => {
    return EngagementEvents.featureUsed(featureName, userId, sessionId);
  },

  /**
   * When user performs a search
   */
  searchPerformed: (query: string, resultsCount: number, userId?: string, sessionId?: string) => {
    return EngagementEvents.searchPerformed(query, resultsCount, userId, sessionId);
  },

  /**
   * When user clicks a notification
   */
  notificationClicked: (type: string, userId: string, sessionId?: string) => {
    return EngagementEvents.notificationClicked(type, userId, sessionId);
  },
};

/**
 * Track growth/viral actions
 * Call these from your share/referral components
 */
export const trackGrowth = {
  /**
   * When user shares referral link
   */
  referralShared: (method: 'instagram' | 'twitter' | 'facebook' | 'copy', userId: string, sessionId?: string) => {
    return GrowthEvents.referralShared(method, userId, sessionId);
  },

  /**
   * When someone signs up via referral
   */
  referralSignup: (referrerId: string, userId: string, sessionId?: string) => {
    return GrowthEvents.referralSignup(referrerId, userId, sessionId);
  },

  /**
   * When user shares achievement (streak, badge, leaderboard)
   */
  achievementShared: (type: string, value: any, userId: string, sessionId?: string) => {
    return GrowthEvents.achievementShared(type, value, userId, sessionId);
  },
};

// =====================================================
// EXAMPLE USAGE IN API ROUTES
// =====================================================

/*

// In your signup API route:
import { trackSignupFlow } from '@/lib/analytics-presets';

export async function POST(req: NextRequest) {
  const { email, password, method } = await req.json();
  
  try {
    const user = await createUser(email, password);
    
    // ✅ Track successful signup
    await trackSignupFlow.completed(user.id, method, req.headers.get('x-session-id'));
    
    return NextResponse.json({ user });
  } catch (error) {
    // ✅ Track failed signup
    await trackSignupFlow.failed(method, error.message, req.headers.get('x-session-id'));
    
    return NextResponse.json({ error }, { status: 400 });
  }
}

// In your booking API route:
import { trackBookingFlow } from '@/lib/analytics-presets';

export async function POST(req: NextRequest) {
  const { facilityId, resourceId, userId } = await req.json();
  
  // ✅ Track booking flow started
  await trackBookingFlow.flowStarted(facilityId, resourceId, userId);
  
  const booking = await createBooking(...);
  
  // ✅ Track booking created
  await trackBookingFlow.created(booking.id, booking.amount, booking.sport, userId);
  
  return NextResponse.json({ booking });
}

// In your Stripe webhook handler:
import { trackPaymentFlow, trackBookingFlow } from '@/lib/analytics-presets';

if (event.type === 'checkout.session.completed') {
  const session = event.data.object;
  
  // ✅ Track payment completed
  await trackPaymentFlow.completed(
    session.amount_total,
    session.payment_intent,
    session.metadata.userId
  );
  
  // ✅ Track booking completed
  await trackBookingFlow.completed(
    session.metadata.bookingId,
    'card',
    session.metadata.userId
  );
}

// In your friend request API route:
import { trackSocialFlow } from '@/lib/analytics-presets';

export async function POST(req: NextRequest) {
  const { fromUserId, toUserId } = await req.json();
  
  await createFriendRequest(fromUserId, toUserId);
  
  // ✅ Track friend request sent
  await trackSocialFlow.friendRequestSent(toUserId, fromUserId);
  
  return NextResponse.json({ success: true });
}

// In your referral share component:
import { trackGrowth } from '@/lib/analytics-presets';

function ShareButton() {
  const handleShare = async (method: 'instagram' | 'twitter' | 'facebook' | 'copy') => {
    // ✅ Track referral shared
    await trackGrowth.referralShared(method, currentUser.id);
    
    // ... open share dialog
  };
  
  return <button onClick={() => handleShare('twitter')}>Share on Twitter</button>;
}

*/


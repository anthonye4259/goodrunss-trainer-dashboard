/**
 * Lightweight Event Tracking for Growth Engines
 * 
 * Tracks all viral growth events to Supabase + Firebase Analytics
 * No PostHog needed for MVP - we can add it later if needed
 */

import { prisma } from '@/lib/prisma'

// Event types for growth loops
export type GrowthEvent = 
  | 'share_generated'           // Trainer creates promo content
  | 'share_clicked'             // User clicks shared link
  | 'share_converted'           // Share leads to signup
  | 'referral_sent'             // User sends referral
  | 'referral_converted'        // Referral converts to booking
  | 'workout_recap_shared'      // User shares workout recap
  | 'group_booking_invite_sent' // User invites friends to booking
  | 'group_booking_joined'      // Friend joins group booking
  | 'review_requested'          // Review prompt shown
  | 'review_submitted'          // User submits review
  | 'qr_code_scanned'           // QR code scanned
  | 'widget_embedded'           // Widget embedded on site
  | 'install_started'           // User starts install
  | 'install_completed'         // Install completed
  | 'session_completed'         // Workout session completed
  | 'streak_started'            // User starts streak
  | 'streak_maintained'         // User maintains streak

export interface GrowthEventData {
  event: GrowthEvent
  userId?: string
  metadata?: {
    // Share tracking
    shareId?: string
    platform?: 'instagram' | 'twitter' | 'snapchat' | 'facebook' | 'sms' | 'email' | 'qr' | 'widget'
    contentType?: 'promo' | 'recap' | 'referral' | 'review'
    
    // Referral tracking
    referralCode?: string
    referrerId?: string
    
    // Booking tracking
    bookingId?: string
    sessionType?: string
    
    // Conversion tracking
    conversionValue?: number
    conversionType?: 'signup' | 'booking' | 'payment'
    
    // A/B test tracking
    abTestId?: string
    variant?: string
    
    // Device/browser info
    userAgent?: string
    ipAddress?: string
    
    // Any additional context
    [key: string]: any
  }
}

/**
 * Track growth event to Supabase + Firebase Analytics
 */
export async function trackGrowthEvent(data: GrowthEventData) {
  try {
    // 1. Save to Supabase (for SQL queries, funnels, cohorts)
    if (data.userId) {
      await prisma.analytics.create({
        data: {
          trainerId: data.userId, // Using trainerId field for all users
          date: new Date(),
          metric: data.event,
          value: data.metadata?.conversionValue || 1,
          metadata: data.metadata as any,
        },
      })
    }

    // 2. Send to Firebase Analytics (for real-time dashboards)
    if (typeof window !== 'undefined' && (window as any).gtag) {
      ;(window as any).gtag('event', data.event, {
        event_category: 'growth',
        event_label: data.metadata?.platform || data.metadata?.contentType,
        value: data.metadata?.conversionValue || 1,
        ...data.metadata
      })
    }

    // 3. Log to console in dev
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Growth Event:', data.event, data.metadata)
    }

    return { success: true }
  } catch (error) {
    console.error('Error tracking growth event:', error)
    return { success: false, error }
  }
}

/**
 * Track funnel step (for conversion analysis)
 */
export async function trackFunnelStep(
  userId: string,
  funnelName: string,
  step: number,
  stepName: string,
  metadata?: any
) {
  return trackGrowthEvent({
    event: 'share_clicked', // Use existing event
    userId,
    metadata: {
      funnelName,
      step,
      stepName,
      ...metadata,
    },
  })
}

/**
 * Calculate viral K-factor (referrals per user)
 */
export async function getViralKFactor(startDate?: Date, endDate?: Date) {
  const referrals = await prisma.referralTracking.findMany({
    where: {
      createdAt: {
        gte: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        lte: endDate || new Date(),
      },
    },
  })

  const totalReferrals = referrals.length
  const uniqueReferrers = new Set(referrals.map(r => r.referrerId)).size
  const kFactor = uniqueReferrers > 0 ? totalReferrals / uniqueReferrers : 0

  return {
    kFactor: kFactor.toFixed(2),
    totalReferrals,
    uniqueReferrers,
    conversionRate: referrals.filter(r => r.converted).length / totalReferrals,
  }
}

/**
 * Get funnel conversion rates
 */
export async function getFunnelMetrics(funnelName: string, startDate?: Date) {
  const events = await prisma.analytics.findMany({
    where: {
      metric: 'share_clicked',
      date: {
        gte: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
      metadata: {
        path: ['funnelName'],
        equals: funnelName,
      },
    },
  })

  // Group by step and calculate conversion
  const steps = events.reduce((acc, event) => {
    const step = (event.metadata as any)?.step || 0
    if (!acc[step]) acc[step] = 0
    acc[step]++
    return acc
  }, {} as Record<number, number>)

  return steps
}

/**
 * Get retention cohort (users active in period X and Y days later)
 */
export async function getRetentionCohort(cohortDate: Date, daysLater: number = 7) {
  const cohortEndDate = new Date(cohortDate)
  cohortEndDate.setDate(cohortEndDate.getDate() + daysLater)

  // Get users who signed up in cohort period
  const cohortUsers = await prisma.user.findMany({
    where: {
      createdAt: {
        gte: cohortDate,
        lte: new Date(cohortDate.getTime() + 1 * 24 * 60 * 60 * 1000), // First day
      },
    },
  })

  // Get active users N days later
  const activeUsers = await prisma.analytics.findMany({
    where: {
      date: {
        gte: cohortEndDate,
        lte: new Date(cohortEndDate.getTime() + 1 * 24 * 60 * 60 * 1000),
      },
      trainerId: {
        in: cohortUsers.map(u => u.id),
      },
    },
    distinct: ['trainerId'],
  })

  return {
    cohortSize: cohortUsers.length,
    activeUsers: activeUsers.length,
    retentionRate: cohortUsers.length > 0 
      ? (activeUsers.length / cohortUsers.length * 100).toFixed(1) + '%'
      : '0%',
  }
}


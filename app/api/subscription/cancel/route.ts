/**
 * Cancel user's subscription (cancel at period end)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getOrCreateUser } from '@/lib/get-or-create-user'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
})

export async function POST(request: NextRequest) {
  try {
    const user = await getOrCreateUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch user's active subscription
    const subscription = await prisma.user_subscriptions.findFirst({
      where: {
        userId: user.id,
        status: {
          in: ['trialing', 'active'],
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    if (!subscription) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      )
    }

    if (!subscription.stripeSubscriptionId) {
      return NextResponse.json(
        { error: 'Subscription not linked to Stripe' },
        { status: 400 }
      )
    }

    // Cancel subscription at period end in Stripe
    const stripeSubscription = await stripe.subscriptions.update(
      subscription.stripeSubscriptionId,
      {
        cancel_at_period_end: true,
      }
    )

    // Update subscription in database
    await prisma.user_subscriptions.update({
      where: { id: subscription.id },
      data: {
        cancelAtPeriodEnd: true,
        canceledAt: new Date(),
        updatedAt: new Date(),
      },
    })

    // Log cancellation to history
    await prisma.subscription_history.create({
      data: {
        id: crypto.randomUUID(),
        userId: user.id,
        userEmail: user.email,
        eventType: 'subscription_canceled',
        fromPlanId: subscription.planId,
        fromPlanName: subscription.planName,
        stripeSubscriptionId: subscription.stripeSubscriptionId,
        reason: 'User requested cancellation',
        metadata: {
          canceledAt: new Date().toISOString(),
          cancelAtPeriodEnd: true,
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Subscription canceled successfully',
    })
  } catch (error: any) {
    console.error('Cancel subscription error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to cancel subscription' },
      { status: 500 }
    )
  }
}


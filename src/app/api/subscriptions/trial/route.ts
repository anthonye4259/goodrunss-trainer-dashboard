import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

/**
 * POST /api/subscriptions/trial
 * Start a free trial
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { planId, trialDays = 14 } = body;

    if (!planId) {
      return NextResponse.json(
        { error: 'Plan ID required' },
        { status: 400 }
      );
    }

    // Check if user already had a trial
    const existingTrial = await prisma.premiumTrial.findFirst({
      where: { userId },
    });

    if (existingTrial && existingTrial.converted) {
      return NextResponse.json(
        { error: 'You have already used your free trial' },
        { status: 400 }
      );
    }

    // Check if user has active subscription
    const existingSub = await prisma.premiumSubscription.findFirst({
      where: {
        userId,
        status: { in: ['active', 'trialing'] },
      },
    });

    if (existingSub) {
      return NextResponse.json(
        { error: 'You already have an active subscription' },
        { status: 400 }
      );
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create or get Stripe customer
    let stripeCustomerId = user.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
        metadata: { userId },
      });
      stripeCustomerId = customer.id;

      await prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId },
      });
    }

    // Get Stripe price ID
    const priceIdMap: Record<string, string> = {
      basic: process.env.STRIPE_BASIC_PRICE_ID!,
      pro: process.env.STRIPE_PRO_PRICE_ID!,
      elite: process.env.STRIPE_ELITE_PRICE_ID!,
    };

    const stripePriceId = priceIdMap[planId];
    if (!stripePriceId) {
      return NextResponse.json({ error: 'Invalid plan ID' }, { status: 400 });
    }

    // Create trial subscription in Stripe
    const trialEnd = Math.floor(Date.now() / 1000) + trialDays * 24 * 60 * 60;
    const subscription = await stripe.subscriptions.create({
      customer: stripeCustomerId,
      items: [{ price: stripePriceId }],
      trial_end: trialEnd,
      payment_settings: {
        payment_method_types: ['card'],
        save_default_payment_method: 'on_subscription',
      },
    });

    // Save subscription to database
    const dbSubscription = await prisma.premiumSubscription.create({
      data: {
        userId,
        tier: planId,
        status: 'trialing',
        stripeSubscriptionId: subscription.id,
        stripeCustomerId,
        stripePriceId,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        trialStart: new Date(),
        trialEnd: new Date(trialEnd * 1000),
      },
    });

    // Create or update trial record
    if (existingTrial) {
      await prisma.premiumTrial.update({
        where: { id: existingTrial.id },
        data: {
          tier: planId,
          startedAt: new Date(),
          endsAt: new Date(trialEnd * 1000),
        },
      });
    } else {
      await prisma.premiumTrial.create({
        data: {
          userId,
          tier: planId,
          startedAt: new Date(),
          endsAt: new Date(trialEnd * 1000),
        },
      });
    }

    return NextResponse.json({
      success: true,
      subscription: dbSubscription,
      trialEndsAt: new Date(trialEnd * 1000),
      message: `${trialDays}-day free trial started!`,
    });
  } catch (error: any) {
    console.error('Error starting trial:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to start trial' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/subscriptions/trial
 * Check trial eligibility
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const trial = await prisma.premiumTrial.findFirst({
      where: { userId },
    });

    const subscription = await prisma.premiumSubscription.findFirst({
      where: {
        userId,
        status: { in: ['active', 'trialing'] },
      },
    });

    const eligible = !trial?.converted && !subscription;

    return NextResponse.json({
      eligible,
      hasUsedTrial: !!trial,
      hasActiveSubscription: !!subscription,
      trialHistory: trial,
    });
  } catch (error) {
    console.error('Error checking trial eligibility:', error);
    return NextResponse.json(
      { error: 'Failed to check trial eligibility' },
      { status: 500 }
    );
  }
}


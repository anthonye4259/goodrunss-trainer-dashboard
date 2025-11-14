import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';

// POST /api/stripe/connect/onboard - Create Stripe Connect account for trainer
export async function POST(req: NextRequest) {
  try {
    const { userId, email, country, returnUrl, refreshUrl } = await req.json();

    if (!userId || !email) {
      return NextResponse.json(
        { error: 'userId and email are required' },
        { status: 400 }
      );
    }

    // Check if trainer already has Stripe account
    const existing = await prisma.stripeAccount.findUnique({
      where: { userId },
    });

    if (existing) {
      // Account exists, create new onboarding link
      const accountLink = await stripe.accountLinks.create({
        account: existing.stripeAccountId,
        refresh_url: refreshUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/payments`,
        return_url: returnUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/payments/success`,
        type: 'account_onboarding',
      });

      return NextResponse.json({
        accountId: existing.stripeAccountId,
        onboardingUrl: accountLink.url,
        existing: true,
      });
    }

    // Create new Stripe Connect account
    const account = await stripe.accounts.create({
      type: 'express',
      country: country || 'US',
      email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: 'individual',
      metadata: {
        userId,
        platform: 'goodrunss',
      },
    });

    // Save to database
    await prisma.stripeAccount.create({
      data: {
        userId,
        stripeAccountId: account.id,
        accountType: 'express',
        email,
        country: country || 'US',
        detailsSubmitted: false,
        chargesEnabled: false,
        payoutsEnabled: false,
        currentlyDue: [],
        eventuallyDue: [],
        pastDue: [],
        pendingVerification: [],
      },
    });

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: refreshUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/payments`,
      return_url: returnUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/payments/success`,
      type: 'account_onboarding',
    });

    return NextResponse.json({
      accountId: account.id,
      onboardingUrl: accountLink.url,
      existing: false,
      message: 'Stripe Connect account created',
    });
  } catch (error: any) {
    console.error('Error creating Stripe Connect account:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create Stripe Connect account' },
      { status: 500 }
    );
  }
}

// GET /api/stripe/connect/onboard - Get onboarding status
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const stripeAccount = await prisma.stripeAccount.findUnique({
      where: { userId },
    });

    if (!stripeAccount) {
      return NextResponse.json({
        exists: false,
        status: 'not_created',
      });
    }

    // Get latest account info from Stripe
    const account = await stripe.accounts.retrieve(stripeAccount.stripeAccountId);

    // Update database with latest info
    await prisma.stripeAccount.update({
      where: { userId },
      data: {
        detailsSubmitted: account.details_submitted || false,
        chargesEnabled: account.charges_enabled || false,
        payoutsEnabled: account.payouts_enabled || false,
        currentlyDue: (account.requirements?.currently_due as string[]) || [],
        eventuallyDue: (account.requirements?.eventually_due as string[]) || [],
        pastDue: (account.requirements?.past_due as string[]) || [],
        pendingVerification: (account.requirements?.pending_verification as string[]) || [],
        defaultCurrency: account.default_currency,
        businessName: account.business_profile?.name,
        businessUrl: account.business_profile?.url,
        supportPhone: account.business_profile?.support_phone,
        supportEmail: account.business_profile?.support_email,
      },
    });

    return NextResponse.json({
      exists: true,
      accountId: stripeAccount.stripeAccountId,
      status: account.details_submitted
        ? 'complete'
        : account.requirements?.currently_due?.length
        ? 'incomplete'
        : 'pending',
      detailsSubmitted: account.details_submitted,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      requirements: {
        currentlyDue: account.requirements?.currently_due || [],
        eventuallyDue: account.requirements?.eventually_due || [],
        pastDue: account.requirements?.past_due || [],
        pendingVerification: account.requirements?.pending_verification || [],
      },
    });
  } catch (error: any) {
    console.error('Error fetching onboarding status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch onboarding status' },
      { status: 500 }
    );
  }
}


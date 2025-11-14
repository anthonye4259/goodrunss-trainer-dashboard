import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

// POST /api/subscriptions/subscribe - Subscribe to a plan
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, userEmail, planName, billingCycle } = body;

    // Validate required fields
    if (!userId || !userEmail || !planName || !billingCycle) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: userId, userEmail, planName, billingCycle",
        },
        { status: 400 }
      );
    }

    // Get plan
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { name: planName },
    });

    if (!plan) {
      return NextResponse.json(
        {
          success: false,
          error: "Plan not found",
        },
        { status: 404 }
      );
    }

    // Check if user already has a subscription
    const existing = await prisma.userSubscription.findFirst({
      where: {
        userId,
        status: {
          in: ["active", "trialing"],
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: "User already has an active subscription",
        },
        { status: 400 }
      );
    }

    // Free plan - no Stripe needed
    if (planName === "free") {
      const subscription = await prisma.userSubscription.create({
        data: {
          userId,
          userEmail,
          planId: plan.id,
          planName: plan.displayName,
          status: "active",
          billingCycle: "monthly",
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        },
      });

      // Log history
      await prisma.subscriptionHistory.create({
        data: {
          userId,
          userEmail,
          eventType: "subscribed",
          toPlanId: plan.id,
          toPlanName: plan.displayName,
          amount: 0,
          currency: "USD",
          billingCycle: "monthly",
        },
      });

      return NextResponse.json({
        success: true,
        subscription,
      });
    }

    // Paid plans - create Stripe checkout session
    const stripePriceId =
      billingCycle === "yearly" ? plan.stripePriceIdYearly : plan.stripePriceIdMonthly;

    if (!stripePriceId) {
      return NextResponse.json(
        {
          success: false,
          error: "Stripe price ID not configured for this plan",
        },
        { status: 500 }
      );
    }

    // Create or retrieve Stripe customer
    let stripeCustomerId: string;
    const existingCustomer = await stripe.customers.list({
      email: userEmail,
      limit: 1,
    });

    if (existingCustomer.data.length > 0) {
      stripeCustomerId = existingCustomer.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          userId,
        },
      });
      stripeCustomerId = customer.id;
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/subscription/canceled`,
      subscription_data: {
        trial_period_days: plan.trialDays > 0 ? plan.trialDays : undefined,
        metadata: {
          userId,
          planId: plan.id,
          planName: plan.name,
        },
      },
      metadata: {
        userId,
        planId: plan.id,
        planName: plan.name,
      },
    });

    return NextResponse.json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id,
    });
  } catch (error: any) {
    console.error("❌ Error subscribing:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

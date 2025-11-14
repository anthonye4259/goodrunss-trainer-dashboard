import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

// POST /api/subscriptions/upgrade - Upgrade subscription plan
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, newPlanName } = body;

    if (!userId || !newPlanName) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: userId, newPlanName",
        },
        { status: 400 }
      );
    }

    // Get current subscription
    const currentSubscription = await prisma.userSubscription.findFirst({
      where: {
        userId,
        status: {
          in: ["active", "trialing"],
        },
      },
      include: {
        plan: true,
      },
    });

    if (!currentSubscription) {
      return NextResponse.json(
        {
          success: false,
          error: "No active subscription found",
        },
        { status: 404 }
      );
    }

    // Get new plan
    const newPlan = await prisma.subscriptionPlan.findUnique({
      where: { name: newPlanName },
    });

    if (!newPlan) {
      return NextResponse.json(
        {
          success: false,
          error: "New plan not found",
        },
        { status: 404 }
      );
    }

    // Can't "upgrade" to free
    if (newPlanName === "free") {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot upgrade to free plan. Use cancel endpoint instead.",
        },
        { status: 400 }
      );
    }

    // Check if this is an upgrade or downgrade
    const planOrder = { free: 0, basic: 1, pro: 2, elite: 3 };
    const currentOrder = planOrder[currentSubscription.plan.name as keyof typeof planOrder];
    const newOrder = planOrder[newPlan.name as keyof typeof planOrder];
    const isUpgrade = newOrder > currentOrder;

    // If current is free, create new subscription
    if (currentSubscription.plan.name === "free") {
      const stripePriceId =
        currentSubscription.billingCycle === "yearly"
          ? newPlan.stripePriceIdYearly
          : newPlan.stripePriceIdMonthly;

      if (!stripePriceId) {
        return NextResponse.json(
          {
            success: false,
            error: "Stripe price ID not configured",
          },
          { status: 500 }
        );
      }

      // Create checkout session
      const session = await stripe.checkout.sessions.create({
        customer_email: currentSubscription.userEmail,
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
          metadata: {
            userId,
            planId: newPlan.id,
            planName: newPlan.name,
          },
        },
      });

      return NextResponse.json({
        success: true,
        checkoutUrl: session.url,
        sessionId: session.id,
      });
    }

    // Update existing Stripe subscription
    if (currentSubscription.stripeSubscriptionId) {
      const stripePriceId =
        currentSubscription.billingCycle === "yearly"
          ? newPlan.stripePriceIdYearly
          : newPlan.stripePriceIdMonthly;

      if (!stripePriceId) {
        return NextResponse.json(
          {
            success: false,
            error: "Stripe price ID not configured",
          },
          { status: 500 }
        );
      }

      // Get current subscription from Stripe
      const stripeSubscription = await stripe.subscriptions.retrieve(
        currentSubscription.stripeSubscriptionId
      );

      // Update subscription with new price
      const updatedSubscription = await stripe.subscriptions.update(
        currentSubscription.stripeSubscriptionId,
        {
          items: [
            {
              id: stripeSubscription.items.data[0].id,
              price: stripePriceId,
            },
          ],
          proration_behavior: isUpgrade ? "always_invoice" : "create_prorations",
          metadata: {
            userId,
            planId: newPlan.id,
            planName: newPlan.name,
          },
        }
      );

      // Update in database
      await prisma.userSubscription.update({
        where: { id: currentSubscription.id },
        data: {
          planId: newPlan.id,
          planName: newPlan.displayName,
          stripePriceId,
          currentPeriodStart: new Date(updatedSubscription.current_period_start * 1000),
          currentPeriodEnd: new Date(updatedSubscription.current_period_end * 1000),
        },
      });

      // Log history
      await prisma.subscriptionHistory.create({
        data: {
          userId,
          userEmail: currentSubscription.userEmail,
          eventType: isUpgrade ? "upgraded" : "downgraded",
          fromPlanId: currentSubscription.planId,
          fromPlanName: currentSubscription.planName,
          toPlanId: newPlan.id,
          toPlanName: newPlan.displayName,
          amount: currentSubscription.billingCycle === "yearly" ? newPlan.priceYearly : newPlan.priceMonthly,
          currency: newPlan.currency,
          billingCycle: currentSubscription.billingCycle,
          stripeSubscriptionId: currentSubscription.stripeSubscriptionId,
        },
      });

      return NextResponse.json({
        success: true,
        message: isUpgrade ? "Subscription upgraded successfully" : "Subscription downgraded",
        subscription: updatedSubscription,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: "No Stripe subscription found",
      },
      { status: 500 }
    );
  } catch (error: any) {
    console.error("❌ Error upgrading subscription:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

// POST /api/subscriptions/cancel - Cancel subscription
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, reason, cancelImmediately } = body;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: "userId is required",
        },
        { status: 400 }
      );
    }

    // Get active subscription
    const subscription = await prisma.userSubscription.findFirst({
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

    if (!subscription) {
      return NextResponse.json(
        {
          success: false,
          error: "No active subscription found",
        },
        { status: 404 }
      );
    }

    // Free plan - just mark as canceled
    if (subscription.plan.name === "free") {
      await prisma.userSubscription.update({
        where: { id: subscription.id },
        data: {
          status: "canceled",
          canceledAt: new Date(),
          cancelReason: reason,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Subscription canceled",
      });
    }

    // Paid plan - cancel in Stripe
    if (subscription.stripeSubscriptionId) {
      if (cancelImmediately) {
        // Cancel immediately
        await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);

        await prisma.userSubscription.update({
          where: { id: subscription.id },
          data: {
            status: "canceled",
            canceledAt: new Date(),
            cancelReason: reason,
          },
        });
      } else {
        // Cancel at period end
        await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
          cancel_at_period_end: true,
        });

        await prisma.userSubscription.update({
          where: { id: subscription.id },
          data: {
            cancelAtPeriodEnd: true,
            canceledAt: new Date(),
            cancelReason: reason,
          },
        });
      }

      // Log history
      await prisma.subscriptionHistory.create({
        data: {
          userId,
          userEmail: subscription.userEmail,
          eventType: "canceled",
          fromPlanId: subscription.planId,
          fromPlanName: subscription.planName,
          reason,
          stripeSubscriptionId: subscription.stripeSubscriptionId,
        },
      });

      return NextResponse.json({
        success: true,
        message: cancelImmediately
          ? "Subscription canceled immediately"
          : "Subscription will cancel at end of billing period",
        cancelAtPeriodEnd: !cancelImmediately,
        periodEnd: subscription.currentPeriodEnd,
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
    console.error("❌ Error canceling subscription:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

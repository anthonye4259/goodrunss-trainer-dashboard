import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/subscriptions/status?userId=xxx - Get user's subscription status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

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
      orderBy: {
        createdAt: "desc",
      },
    });

    // If no subscription, return free plan
    if (!subscription) {
      const freePlan = await prisma.subscriptionPlan.findUnique({
        where: { name: "free" },
      });

      return NextResponse.json({
        success: true,
        subscription: null,
        plan: freePlan,
        features: freePlan?.features || {},
        limits: {
          giaQueriesPerDay: freePlan?.giaQueriesPerDay || 3,
          aiPersonasPerDay: freePlan?.aiPersonasPerDay || 0,
          aiWorkoutPlansPerMonth: freePlan?.aiWorkoutPlansPerMonth || 0,
          bookingDiscountPercent: freePlan?.bookingDiscountPercent || 0,
        },
        isFreePlan: true,
      });
    }

    return NextResponse.json({
      success: true,
      subscription,
      plan: subscription.plan,
      features: subscription.plan.features,
      limits: {
        giaQueriesPerDay: subscription.plan.giaQueriesPerDay,
        aiPersonasPerDay: subscription.plan.aiPersonasPerDay,
        aiWorkoutPlansPerMonth: subscription.plan.aiWorkoutPlansPerMonth,
        bookingDiscountPercent: subscription.plan.bookingDiscountPercent,
      },
      isFreePlan: false,
      isTrialing: subscription.status === "trialing",
      trialEndsAt: subscription.trialEnd,
    });
  } catch (error: any) {
    console.error("❌ Error fetching subscription status:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

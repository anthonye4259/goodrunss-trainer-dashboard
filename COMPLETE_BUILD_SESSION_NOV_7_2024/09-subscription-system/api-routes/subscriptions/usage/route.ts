import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/subscriptions/usage - Track feature usage
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, featureType, featureId, metadata } = body;

    if (!userId || !featureType) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: userId, featureType",
        },
        { status: 400 }
      );
    }

    // Get user's subscription
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

    // Track usage
    const usage = await prisma.subscriptionUsage.create({
      data: {
        subscriptionId: subscription.id,
        userId,
        featureType,
        featureId,
        metadata,
        usedAt: new Date(),
        date: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      usage,
    });
  } catch (error: any) {
    console.error("❌ Error tracking usage:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// GET /api/subscriptions/usage?userId=xxx&featureType=gia_query&date=2025-01-01
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const featureType = searchParams.get("featureType");
    const dateParam = searchParams.get("date");

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: "userId is required",
        },
        { status: 400 }
      );
    }

    // Get user's subscription
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

    // Parse date or use today
    const targetDate = dateParam ? new Date(dateParam) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Build query
    const where: any = {
      userId,
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
    };

    if (featureType) {
      where.featureType = featureType;
    }

    // Get usage count
    const usageCount = await prisma.subscriptionUsage.count({
      where,
    });

    // Get limit from plan
    let limit = -1; // unlimited
    let limitReached = false;

    if (featureType === "gia_query") {
      limit = subscription.plan.giaQueriesPerDay;
      limitReached = limit !== -1 && usageCount >= limit;
    } else if (featureType === "ai_persona_session") {
      limit = subscription.plan.aiPersonasPerDay;
      limitReached = limit !== -1 && usageCount >= limit;
    }

    return NextResponse.json({
      success: true,
      usage: {
        count: usageCount,
        limit,
        limitReached,
        remaining: limit === -1 ? -1 : Math.max(0, limit - usageCount),
      },
      plan: {
        name: subscription.plan.name,
        displayName: subscription.plan.displayName,
      },
    });
  } catch (error: any) {
    console.error("❌ Error fetching usage:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}


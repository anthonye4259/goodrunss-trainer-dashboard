import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/subscriptions/check-access - Check if user can access a feature
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, featureType } = body;

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

    // No subscription = free plan
    if (!subscription) {
      const freePlan = await prisma.subscriptionPlan.findUnique({
        where: { name: "free" },
      });

      if (!freePlan) {
        return NextResponse.json(
          {
            success: false,
            error: "Free plan not found",
          },
          { status: 500 }
        );
      }

      // Check free plan limits
      if (featureType === "gia_query") {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const usageCount = await prisma.subscriptionUsage.count({
          where: {
            userId,
            featureType: "gia_query",
            date: {
              gte: today,
            },
          },
        });

        const limit = freePlan.giaQueriesPerDay;
        const hasAccess = limit === -1 || usageCount < limit;

        return NextResponse.json({
          success: true,
          hasAccess,
          reason: hasAccess ? null : "Daily limit reached. Upgrade to Basic for unlimited queries!",
          plan: "free",
          usage: {
            count: usageCount,
            limit,
            remaining: limit === -1 ? -1 : Math.max(0, limit - usageCount),
          },
          upgradeRequired: !hasAccess,
          recommendedPlan: "basic",
        });
      }

      if (featureType === "ai_persona_session") {
        return NextResponse.json({
          success: true,
          hasAccess: false,
          reason: "AI Persona sessions require Basic plan or higher",
          plan: "free",
          upgradeRequired: true,
          recommendedPlan: "basic",
        });
      }

      // Default: no access
      return NextResponse.json({
        success: true,
        hasAccess: false,
        reason: "This feature requires a paid subscription",
        plan: "free",
        upgradeRequired: true,
        recommendedPlan: "basic",
      });
    }

    // Check paid plan access
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (featureType === "gia_query") {
      const usageCount = await prisma.subscriptionUsage.count({
        where: {
          userId,
          featureType: "gia_query",
          date: {
            gte: today,
          },
        },
      });

      const limit = subscription.plan.giaQueriesPerDay;
      const hasAccess = limit === -1 || usageCount < limit;

      return NextResponse.json({
        success: true,
        hasAccess,
        reason: hasAccess ? null : "Daily limit reached",
        plan: subscription.plan.name,
        usage: {
          count: usageCount,
          limit,
          remaining: limit === -1 ? -1 : Math.max(0, limit - usageCount),
        },
        upgradeRequired: false,
      });
    }

    if (featureType === "ai_persona_session") {
      const usageCount = await prisma.subscriptionUsage.count({
        where: {
          userId,
          featureType: "ai_persona_session",
          date: {
            gte: today,
          },
        },
      });

      const limit = subscription.plan.aiPersonasPerDay;
      const hasAccess = limit === -1 || usageCount < limit;

      return NextResponse.json({
        success: true,
        hasAccess,
        reason: hasAccess ? null : `Daily limit reached. Upgrade to ${subscription.plan.name === "basic" ? "Pro" : "Elite"} for unlimited!`,
        plan: subscription.plan.name,
        usage: {
          count: usageCount,
          limit,
          remaining: limit === -1 ? -1 : Math.max(0, limit - usageCount),
        },
        upgradeRequired: !hasAccess && subscription.plan.name === "basic",
        recommendedPlan: subscription.plan.name === "basic" ? "pro" : null,
      });
    }

    if (featureType === "ai_workout_plan") {
      // Check monthly usage
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      const usageCount = await prisma.subscriptionUsage.count({
        where: {
          userId,
          featureType: "ai_workout_plan",
          date: {
            gte: firstDayOfMonth,
          },
        },
      });

      const limit = subscription.plan.aiWorkoutPlansPerMonth;
      const hasAccess = limit === -1 || usageCount < limit;

      return NextResponse.json({
        success: true,
        hasAccess,
        reason: hasAccess ? null : "Monthly limit reached. Upgrade for more!",
        plan: subscription.plan.name,
        usage: {
          count: usageCount,
          limit,
          remaining: limit === -1 ? -1 : Math.max(0, limit - usageCount),
        },
        upgradeRequired: !hasAccess,
        recommendedPlan: subscription.plan.name === "basic" ? "pro" : "elite",
      });
    }

    // Feature-based access (from JSON features)
    const features = subscription.plan.features as any;
    
    const featureMap: Record<string, string> = {
      voice_coaching: "voiceCoaching",
      ai_form_check: "aiFormCheck",
      cross_training: "crossTrainingPlans",
      injury_prevention: "injuryPrevention",
      video_analysis: "videoAnalysis",
      custom_ai_personas: "customAIPersonas",
      tournament_prep: "tournamentPrep",
      equipment_ai: "equipmentAI",
      concierge_booking: "conciergeBooking",
    };

    const featureKey = featureMap[featureType];
    if (featureKey && features[featureKey]) {
      return NextResponse.json({
        success: true,
        hasAccess: true,
        plan: subscription.plan.name,
        upgradeRequired: false,
      });
    }

    // Default: check if feature requires upgrade
    return NextResponse.json({
      success: true,
      hasAccess: false,
      reason: `This feature is not included in your ${subscription.plan.displayName} plan`,
      plan: subscription.plan.name,
      upgradeRequired: true,
      recommendedPlan: subscription.plan.name === "basic" ? "pro" : "elite",
    });
  } catch (error: any) {
    console.error("❌ Error checking access:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}


import { prisma } from "@/lib/prisma";

/**
 * Subscription middleware - Check if user has access to a feature
 * Use this before allowing access to premium features
 */
export async function checkSubscriptionAccess(
  userId: string,
  featureType: string
): Promise<{
  hasAccess: boolean;
  reason?: string;
  plan: string;
  upgradeRequired: boolean;
  recommendedPlan?: string;
  usage?: {
    count: number;
    limit: number;
    remaining: number;
  };
}> {
  try {
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
        throw new Error("Free plan not found");
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

        return {
          hasAccess,
          reason: hasAccess ? undefined : "Daily limit reached. Upgrade to Basic for unlimited queries!",
          plan: "free",
          usage: {
            count: usageCount,
            limit,
            remaining: limit === -1 ? -1 : Math.max(0, limit - usageCount),
          },
          upgradeRequired: !hasAccess,
          recommendedPlan: "basic",
        };
      }

      // AI Persona requires paid plan
      if (featureType === "ai_persona_session") {
        return {
          hasAccess: false,
          reason: "AI Persona sessions require Basic plan or higher",
          plan: "free",
          upgradeRequired: true,
          recommendedPlan: "basic",
        };
      }

      // Default: no access
      return {
        hasAccess: false,
        reason: "This feature requires a paid subscription",
        plan: "free",
        upgradeRequired: true,
        recommendedPlan: "basic",
      };
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

      return {
        hasAccess,
        reason: hasAccess ? undefined : "Daily limit reached",
        plan: subscription.plan.name,
        usage: {
          count: usageCount,
          limit,
          remaining: limit === -1 ? -1 : Math.max(0, limit - usageCount),
        },
        upgradeRequired: false,
      };
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

      return {
        hasAccess,
        reason: hasAccess ? undefined : `Daily limit reached. Upgrade to ${subscription.plan.name === "basic" ? "Pro" : "Elite"} for unlimited!`,
        plan: subscription.plan.name,
        usage: {
          count: usageCount,
          limit,
          remaining: limit === -1 ? -1 : Math.max(0, limit - usageCount),
        },
        upgradeRequired: !hasAccess && subscription.plan.name === "basic",
        recommendedPlan: subscription.plan.name === "basic" ? "pro" : undefined,
      };
    }

    // Default: has access (paid plan)
    return {
      hasAccess: true,
      plan: subscription.plan.name,
      upgradeRequired: false,
    };
  } catch (error: any) {
    console.error("❌ Error checking subscription access:", error);
    throw error;
  }
}

/**
 * Track feature usage
 */
export async function trackUsage(
  userId: string,
  featureType: string,
  featureId?: string,
  metadata?: any
): Promise<void> {
  try {
    // Get user's subscription
    const subscription = await prisma.userSubscription.findFirst({
      where: {
        userId,
        status: {
          in: ["active", "trialing"],
        },
      },
    });

    if (!subscription) {
      // Even free users get tracked
      // Create a virtual "free" subscription if needed
      const freePlan = await prisma.subscriptionPlan.findUnique({
        where: { name: "free" },
      });

      if (freePlan) {
        // For free users, we still track usage without a subscription record
        // This is handled by the API, so we can skip here
        console.log("📊 Free user usage tracked externally");
      }
      return;
    }

    // Track usage
    await prisma.subscriptionUsage.create({
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

    console.log(`📊 Tracked ${featureType} usage for user ${userId}`);
  } catch (error: any) {
    console.error("❌ Error tracking usage:", error);
    // Don't throw - usage tracking shouldn't block the main operation
  }
}

/**
 * Get booking discount for user
 */
export async function getBookingDiscount(userId: string): Promise<number> {
  try {
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
      return 0; // No discount for free users
    }

    return subscription.plan.bookingDiscountPercent;
  } catch (error: any) {
    console.error("❌ Error getting booking discount:", error);
    return 0;
  }
}


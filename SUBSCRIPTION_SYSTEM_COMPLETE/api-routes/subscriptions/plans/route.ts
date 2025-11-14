import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/subscriptions/plans - Get all subscription plans
export async function GET(request: NextRequest) {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        sortOrder: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      plans,
    });
  } catch (error: any) {
    console.error("❌ Error fetching plans:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// POST /api/subscriptions/plans - Create/seed subscription plans (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === "seed") {
      // Seed default plans
      const plans = [
        {
          name: "free",
          displayName: "Free",
          description: "Get started with GoodRunss",
          priceMonthly: 0,
          priceYearly: 0,
          currency: "USD",
          features: {
            giaQueries: "3/day",
            aiPersonas: "None",
            workoutPlans: "None",
            bookingDiscount: "0%",
            multiSportTracking: false,
            environmentalAlerts: false,
            advancedFilters: false,
            sportCommunity: false,
          },
          giaQueriesPerDay: 3,
          aiPersonasPerDay: 0,
          aiWorkoutPlansPerMonth: 0,
          bookingDiscountPercent: 0,
          isActive: true,
          sortOrder: 0,
          trialDays: 0,
        },
        {
          name: "basic",
          displayName: "Basic",
          description: "Perfect for casual athletes",
          priceMonthly: 4.99,
          priceYearly: 47.90, // ~20% discount
          currency: "USD",
          features: {
            giaQueries: "Unlimited",
            aiPersonas: "1/day",
            workoutPlans: "3/month",
            bookingDiscount: "0%",
            multiSportTracking: true,
            environmentalAlerts: true,
            advancedFilters: true,
            sportCommunity: false,
            waitlistAccess: true,
          },
          giaQueriesPerDay: -1, // unlimited
          aiPersonasPerDay: 1,
          aiWorkoutPlansPerMonth: 3,
          bookingDiscountPercent: 0,
          isActive: true,
          sortOrder: 1,
          trialDays: 14,
        },
        {
          name: "pro",
          displayName: "Pro",
          description: "For serious athletes training across multiple sports",
          priceMonthly: 14.99,
          priceYearly: 143.90, // ~20% discount
          currency: "USD",
          features: {
            giaQueries: "Unlimited",
            aiPersonas: "Unlimited",
            workoutPlans: "Unlimited",
            bookingDiscount: "10%",
            multiSportTracking: true,
            environmentalAlerts: true,
            advancedFilters: true,
            sportCommunity: true,
            waitlistAccess: true,
            priorityBooking: true,
            flexibleCancellation: true,
            noBookingFees: true,
            voiceCoaching: true,
            aiFormCheck: true,
            crossTrainingPlans: true,
            injuryPrevention: true,
            analyticsPerSport: true,
            findPartners: true,
            groupClasses: true,
          },
          giaQueriesPerDay: -1, // unlimited
          aiPersonasPerDay: -1, // unlimited
          aiWorkoutPlansPerMonth: -1, // unlimited
          bookingDiscountPercent: 10,
          isActive: true,
          sortOrder: 2,
          trialDays: 14,
        },
        {
          name: "elite",
          displayName: "Elite",
          description: "White-glove service for elite athletes",
          priceMonthly: 29.99,
          priceYearly: 287.90, // ~20% discount
          currency: "USD",
          features: {
            giaQueries: "Unlimited",
            aiPersonas: "Unlimited + Custom",
            workoutPlans: "Unlimited",
            bookingDiscount: "20%",
            multiSportTracking: true,
            environmentalAlerts: true,
            advancedFilters: true,
            sportCommunity: true,
            waitlistAccess: true,
            priorityBooking: true,
            flexibleCancellation: true,
            noBookingFees: true,
            voiceCoaching: true,
            aiFormCheck: true,
            crossTrainingPlans: true,
            injuryPrevention: true,
            analyticsPerSport: true,
            findPartners: true,
            groupClasses: true,
            customAIPersonas: true,
            videoAnalysis: true,
            proComparison: true,
            tournamentPrep: true,
            equipmentAI: true,
            eliteTrainerAccess: true,
            celebrityTrainers: true,
            conciergeBooking: true,
            travelMatching: true,
            familyMembers: 5,
          },
          giaQueriesPerDay: -1, // unlimited
          aiPersonasPerDay: -1, // unlimited
          aiWorkoutPlansPerMonth: -1, // unlimited
          bookingDiscountPercent: 20,
          isActive: true,
          sortOrder: 3,
          trialDays: 14,
        },
      ];

      // Upsert plans
      for (const plan of plans) {
        await prisma.subscriptionPlan.upsert({
          where: { name: plan.name },
          update: plan,
          create: plan,
        });
      }

      return NextResponse.json({
        success: true,
        message: "Plans seeded successfully",
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: "Invalid action",
      },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("❌ Error seeding plans:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

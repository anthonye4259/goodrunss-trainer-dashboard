import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/facility-reports/credits?userId=xxx - Get user's available credits
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

    const stats = await prisma.userReporterStats.findUnique({
      where: { userId },
    });

    if (!stats) {
      return NextResponse.json({
        success: true,
        availableCredits: 0,
        totalEarned: 0,
      });
    }

    return NextResponse.json({
      success: true,
      availableCredits: stats.pendingCredits,
      totalEarned: stats.totalEarned,
      totalBonuses: stats.totalBonuses,
    });
  } catch (error: any) {
    console.error("❌ Error fetching credits:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// POST /api/facility-reports/credits/apply - Apply credits to a booking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, amount, bookingId, notes } = body;

    if (!userId || !amount) {
      return NextResponse.json(
        {
          success: false,
          error: "userId and amount are required",
        },
        { status: 400 }
      );
    }

    const stats = await prisma.userReporterStats.findUnique({
      where: { userId },
    });

    if (!stats || stats.pendingCredits < amount) {
      return NextResponse.json(
        {
          success: false,
          error: "Insufficient credits",
          available: stats?.pendingCredits || 0,
        },
        { status: 400 }
      );
    }

    // Deduct credits
    const updated = await prisma.userReporterStats.update({
      where: { userId },
      data: {
        pendingCredits: { decrement: amount },
      },
    });

    // TODO: Apply discount to booking in your booking system
    // This would integrate with your existing booking API

    return NextResponse.json({
      success: true,
      applied: amount,
      remainingCredits: updated.pendingCredits,
      bookingId,
      message: `$${amount.toFixed(2)} discount applied!`,
    });
  } catch (error: any) {
    console.error("❌ Error applying credits:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}


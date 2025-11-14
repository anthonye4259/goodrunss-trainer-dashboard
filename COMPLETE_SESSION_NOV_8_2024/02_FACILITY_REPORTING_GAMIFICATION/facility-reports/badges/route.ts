import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/facility-reports/badges?userId=xxx - Get user's badges
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (userId) {
      // Get user's badges
      const userBadges = await prisma.userBadge.findMany({
        where: { userId },
        include: {
          badge: true,
        },
        orderBy: {
          earnedAt: "desc",
        },
      });

      return NextResponse.json({
        success: true,
        badges: userBadges.map((ub) => ({
          ...ub.badge,
          earnedAt: ub.earnedAt,
        })),
      });
    } else {
      // Get all available badges
      const allBadges = await prisma.reporterBadge.findMany({
        where: { isActive: true },
        orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
      });

      return NextResponse.json({
        success: true,
        badges: allBadges,
      });
    }
  } catch (error: any) {
    console.error("❌ Error fetching badges:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}


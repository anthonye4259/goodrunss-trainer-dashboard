import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/facility-reports/stats?userId=xxx - Get user's reporter stats
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

    // Get stats
    let stats = await prisma.userReporterStats.findUnique({
      where: { userId },
    });

    if (!stats) {
      stats = await prisma.userReporterStats.create({
        data: { userId },
      });
    }

    // Get badges
    const userBadges = await prisma.userBadge.findMany({
      where: { userId },
      include: {
        badge: true,
      },
      orderBy: {
        earnedAt: "desc",
      },
    });

    // Get recent reports
    const recentReports = await prisma.facilityReport.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    const recentMaintenance = await prisma.maintenanceReport.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    // Calculate level progress
    const currentLevel = Math.floor(stats.xp / 100) + 1;
    const xpForNextLevel = currentLevel * 100;
    const xpProgress = stats.xp - (currentLevel - 1) * 100;
    const xpNeeded = xpForNextLevel - stats.xp;

    // Get level name
    const levelName = getLevelName(currentLevel);

    return NextResponse.json({
      success: true,
      stats: {
        ...stats,
        level: currentLevel,
        levelName,
        xpProgress,
        xpNeeded,
        xpForNextLevel,
      },
      badges: userBadges.map((ub) => ({
        ...ub.badge,
        earnedAt: ub.earnedAt,
      })),
      recentActivity: {
        facilityReports: recentReports,
        maintenanceReports: recentMaintenance,
      },
    });
  } catch (error: any) {
    console.error("❌ Error fetching reporter stats:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

function getLevelName(level: number): string {
  if (level === 1) return "🌱 Scout";
  if (level === 2) return "🌿 Reporter";
  if (level === 3) return "🌳 Contributor";
  if (level === 4) return "⭐ Expert";
  if (level === 5) return "💎 Master";
  if (level >= 6) return "👑 Legend";
  return "Elite Scout";
}


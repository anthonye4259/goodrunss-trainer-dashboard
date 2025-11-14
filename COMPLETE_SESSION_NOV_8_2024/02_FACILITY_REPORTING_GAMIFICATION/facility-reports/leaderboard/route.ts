import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/facility-reports/leaderboard?period=weekly&limit=100
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "weekly"; // weekly, monthly, alltime
    const limit = parseInt(searchParams.get("limit") || "100");

    let rankings: any[] = [];

    if (period === "alltime") {
      // All-time rankings
      rankings = await prisma.userReporterStats.findMany({
        where: {
          totalReports: { gt: 0 },
        },
        orderBy: {
          totalReports: "desc",
        },
        take: limit,
      });
    } else {
      // Weekly or monthly rankings
      const now = new Date();
      let startDate: Date;

      if (period === "weekly") {
        // Start of current week (Sunday)
        startDate = new Date(now);
        startDate.setDate(now.getDate() - now.getDay());
        startDate.setHours(0, 0, 0, 0);
      } else {
        // Start of current month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }

      // Get reports for the period
      const facilityReports = await prisma.facilityReport.groupBy({
        by: ["userId"],
        where: {
          createdAt: { gte: startDate },
        },
        _count: { id: true },
        _sum: { rewardAmount: true, bonusAmount: true },
      });

      const maintenanceReports = await prisma.maintenanceReport.groupBy({
        by: ["userId"],
        where: {
          createdAt: { gte: startDate },
        },
        _count: { id: true },
        _sum: { rewardAmount: true, bonusAmount: true },
      });

      // Combine and calculate totals
      const userTotals = new Map();

      facilityReports.forEach((report) => {
        userTotals.set(report.userId, {
          userId: report.userId,
          reports: report._count.id,
          earned: (report._sum.rewardAmount || 0) + (report._sum.bonusAmount || 0),
        });
      });

      maintenanceReports.forEach((report) => {
        const existing = userTotals.get(report.userId) || {
          userId: report.userId,
          reports: 0,
          earned: 0,
        };
        userTotals.set(report.userId, {
          userId: report.userId,
          reports: existing.reports + report._count.id,
          earned: existing.earned + (report._sum.rewardAmount || 0) + (report._sum.bonusAmount || 0),
        });
      });

      // Convert to array and sort
      rankings = Array.from(userTotals.values())
        .sort((a, b) => b.reports - a.reports)
        .slice(0, limit);

      // Get user stats for each
      const userIds = rankings.map((r) => r.userId);
      const statsMap = await prisma.userReporterStats.findMany({
        where: { userId: { in: userIds } },
      });

      const statsById = new Map(statsMap.map((s) => [s.userId, s]));

      rankings = rankings.map((r, index) => ({
        ...r,
        rank: index + 1,
        ...statsById.get(r.userId),
      }));
    }

    // Add rank numbers if not already present
    rankings = rankings.map((r, index) => ({
      ...r,
      rank: r.rank || index + 1,
    }));

    return NextResponse.json({
      success: true,
      period,
      rankings,
      total: rankings.length,
    });
  } catch (error: any) {
    console.error("❌ Error fetching leaderboard:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}


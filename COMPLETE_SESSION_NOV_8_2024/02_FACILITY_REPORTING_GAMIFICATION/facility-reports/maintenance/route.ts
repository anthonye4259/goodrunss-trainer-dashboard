import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/facility-reports/maintenance - Submit maintenance report
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      facilityId,
      sport,
      specificLocation,
      category,
      issue,
      severity,
      description,
      photos,
      videos,
    } = body;

    if (!userId || !facilityId || !sport || !category || !issue || !severity) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
        },
        { status: 400 }
      );
    }

    // Get user's reporter stats
    let stats = await prisma.userReporterStats.findUnique({
      where: { userId },
    });

    if (!stats) {
      stats = await prisma.userReporterStats.create({
        data: { userId },
      });
    }

    // Calculate reward (maintenance reports are worth more!)
    let baseReward = 3.0; // $3 base for maintenance
    let bonusReward = 0.0;

    // Photo bonus
    if (photos && photos.length > 0) {
      bonusReward += 2.0; // +$2 for photo
    }

    // Video bonus
    if (videos && videos.length > 0) {
      bonusReward += 4.0; // +$4 for video
    }

    // Severity multiplier
    let severityMultiplier = 1.0;
    if (severity === "urgent") {
      severityMultiplier = 3.0;
      bonusReward += 10.0; // Extra $10 for urgent issues
    } else if (severity === "high") {
      severityMultiplier = 2.0;
      bonusReward += 5.0;
    } else if (severity === "medium") {
      severityMultiplier = 1.5;
    }

    const totalReward = (baseReward + bonusReward) * severityMultiplier;

    // Create maintenance report
    const report = await prisma.maintenanceReport.create({
      data: {
        userId,
        facilityId,
        sport,
        specificLocation,
        category,
        issue,
        severity,
        description,
        photos: photos || [],
        videos: videos || [],
        rewardAmount: baseReward,
        bonusAmount: bonusReward * severityMultiplier,
      },
    });

    // Update user stats
    const updatedStats = await prisma.userReporterStats.update({
      where: { userId },
      data: {
        totalReports: { increment: 1 },
        maintenanceReports: { increment: 1 },
        totalEarned: { increment: totalReward },
        totalBonuses: { increment: bonusReward * severityMultiplier },
        pendingCredits: { increment: totalReward },
        xp: { increment: 25 }, // 25 XP for maintenance (higher than regular)
      },
    });

    // Check for level up
    const newLevel = Math.floor(updatedStats.xp / 100) + 1;
    if (newLevel > updatedStats.level) {
      await prisma.userReporterStats.update({
        where: { userId },
        data: { level: newLevel },
      });
    }

    // Check for maintenance-specific badges
    const newBadges = await checkMaintenanceBadges(userId, updatedStats);

    // Send urgent notification to facility if severity is high/urgent
    if (severity === "urgent" || severity === "high") {
      // TODO: Send notification to facility manager
      console.log(`🚨 URGENT: ${severity} issue at facility ${facilityId}`);
    }

    return NextResponse.json({
      success: true,
      report,
      rewards: {
        baseAmount: baseReward,
        bonusAmount: bonusReward,
        severityMultiplier,
        totalAmount: totalReward,
      },
      stats: {
        ...updatedStats,
        level: newLevel,
      },
      newBadges,
      isUrgent: severity === "urgent" || severity === "high",
    });
  } catch (error: any) {
    console.error("❌ Error submitting maintenance report:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// Helper: Check and award maintenance badges
async function checkMaintenanceBadges(userId: string, stats: any) {
  const newBadges = [];

  const milestones = [
    { reports: 1, badge: "first_maintenance" },
    { reports: 10, badge: "maintenance_helper" },
    { reports: 50, badge: "facility_guardian" },
    { reports: 200, badge: "maintenance_master" },
  ];

  for (const milestone of milestones) {
    if (stats.maintenanceReports === milestone.reports) {
      const badge = await prisma.reporterBadge.findUnique({
        where: { name: milestone.badge },
      });

      if (badge) {
        const existing = await prisma.userBadge.findUnique({
          where: { userId_badgeId: { userId, badgeId: badge.id } },
        });

        if (!existing) {
          await prisma.userBadge.create({
            data: { userId, badgeId: badge.id },
          });
          newBadges.push(badge);
        }
      }
    }
  }

  return newBadges;
}


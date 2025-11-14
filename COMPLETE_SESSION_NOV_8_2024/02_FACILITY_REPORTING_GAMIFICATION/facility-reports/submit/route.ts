import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/facility-reports/submit - Submit facility condition report
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      facilityId,
      sport,
      specificLocation,
      crowdLevel,
      skillLevel,
      ageGroup,
      weatherCondition,
      surfaceCondition,
      waitTime,
      parkingAvailability,
      notes,
      photos,
      videos,
      gpsLat,
      gpsLng,
    } = body;

    if (!userId || !facilityId || !sport) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: userId, facilityId, sport",
        },
        { status: 400 }
      );
    }

    // Get user's reporter stats
    let stats = await prisma.userReporterStats.findUnique({
      where: { userId },
    });

    if (!stats) {
      // Create stats if doesn't exist
      stats = await prisma.userReporterStats.create({
        data: { userId },
      });
    }

    // Calculate reward
    let baseReward = 1.0; // $1 base
    let bonusReward = 0.0;

    // Photo bonus
    if (photos && photos.length > 0) {
      bonusReward += 1.0; // +$1 for photo
    }

    // Video bonus
    if (videos && videos.length > 0) {
      bonusReward += 2.0; // +$2 for video
    }

    // Check/update streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastReport = stats.lastReportDate ? new Date(stats.lastReportDate) : null;
    let streakMultiplier = 1.0;
    let newStreak = stats.currentStreak;

    if (lastReport) {
      lastReport.setHours(0, 0, 0, 0);
      const daysSince = Math.floor((today.getTime() - lastReport.getTime()) / (1000 * 60 * 60 * 24));

      if (daysSince === 1) {
        // Continue streak
        newStreak += 1;
      } else if (daysSince === 0) {
        // Same day, keep streak
        newStreak = stats.currentStreak;
      } else {
        // Streak broken
        newStreak = 1;
      }
    } else {
      newStreak = 1;
    }

    // Apply streak multipliers
    if (newStreak >= 100) {
      streakMultiplier = 5.0;
    } else if (newStreak >= 30) {
      streakMultiplier = 3.0;
    } else if (newStreak >= 7) {
      streakMultiplier = 2.0;
    } else if (newStreak >= 3) {
      streakMultiplier = 1.5;
    }

    const totalReward = (baseReward + bonusReward) * streakMultiplier;

    // Create report
    const report = await prisma.facilityReport.create({
      data: {
        userId,
        facilityId,
        sport,
        specificLocation,
        crowdLevel,
        skillLevel,
        ageGroup,
        weatherCondition,
        surfaceCondition,
        waitTime,
        parkingAvailability,
        notes,
        photos: photos || [],
        videos: videos || [],
        gpsLat,
        gpsLng,
        rewardAmount: baseReward + bonusReward,
        bonusAmount: bonusReward,
        streakMultiplier,
      },
    });

    // Update user stats
    const updatedStats = await prisma.userReporterStats.update({
      where: { userId },
      data: {
        totalReports: { increment: 1 },
        facilityReports: { increment: 1 },
        currentStreak: newStreak,
        longestStreak: Math.max(newStreak, stats.longestStreak),
        lastReportDate: today,
        totalEarned: { increment: totalReward },
        totalBonuses: { increment: bonusReward * streakMultiplier },
        pendingCredits: { increment: totalReward },
        xp: { increment: 10 }, // 10 XP per report
      },
    });

    // Check for level up (every 100 XP = 1 level)
    const newLevel = Math.floor(updatedStats.xp / 100) + 1;
    if (newLevel > updatedStats.level) {
      await prisma.userReporterStats.update({
        where: { userId },
        data: { level: newLevel },
      });
    }

    // Check for new badges
    const newBadges = await checkAndAwardBadges(userId, updatedStats);

    // Check streak milestone bonuses
    const streakBonus = getStreakBonus(newStreak, stats.currentStreak);
    if (streakBonus > 0) {
      await prisma.userReporterStats.update({
        where: { userId },
        data: {
          totalBonuses: { increment: streakBonus },
          pendingCredits: { increment: streakBonus },
        },
      });
    }

    return NextResponse.json({
      success: true,
      report,
      rewards: {
        baseAmount: baseReward,
        bonusAmount: bonusReward,
        streakMultiplier,
        totalAmount: totalReward,
        streakBonus,
      },
      stats: {
        ...updatedStats,
        level: newLevel,
        currentStreak: newStreak,
      },
      newBadges,
      streakMilestone: newStreak >= 3 && [3, 7, 30, 100].includes(newStreak),
    });
  } catch (error: any) {
    console.error("❌ Error submitting facility report:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// Helper: Check and award badges
async function checkAndAwardBadges(userId: string, stats: any) {
  const newBadges = [];

  // Milestone badges
  const milestones = [
    { reports: 1, badge: "first_report" },
    { reports: 10, badge: "active_reporter" },
    { reports: 25, badge: "contributor" },
    { reports: 50, badge: "expert" },
    { reports: 100, badge: "master" },
    { reports: 250, badge: "legend" },
    { reports: 500, badge: "elite_scout" },
  ];

  for (const milestone of milestones) {
    if (stats.totalReports === milestone.reports) {
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

  // Streak badges
  if (stats.currentStreak === 30) {
    const badge = await prisma.reporterBadge.findUnique({
      where: { name: "streak_master" },
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

  return newBadges;
}

// Helper: Get streak bonus for milestones
function getStreakBonus(newStreak: number, oldStreak: number): number {
  const milestones = [
    { streak: 3, bonus: 0 },
    { streak: 7, bonus: 0 },
    { streak: 30, bonus: 25 },
    { streak: 100, bonus: 100 },
  ];

  for (const milestone of milestones) {
    if (newStreak === milestone.streak && oldStreak < milestone.streak) {
      return milestone.bonus;
    }
  }

  return 0;
}


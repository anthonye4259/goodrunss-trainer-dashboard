import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/facility-reports/challenges?userId=xxx - Get active challenges with user progress
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    const now = new Date();

    // Get active challenges
    const challenges = await prisma.reporterChallenge.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      orderBy: {
        endDate: "asc",
      },
    });

    if (!userId) {
      return NextResponse.json({
        success: true,
        challenges,
      });
    }

    // Get user's progress for each challenge
    const userProgress = await prisma.userChallenge.findMany({
      where: {
        userId,
        challengeId: { in: challenges.map((c) => c.id) },
      },
    });

    const progressMap = new Map(userProgress.map((p) => [p.challengeId, p]));

    const challengesWithProgress = challenges.map((challenge) => {
      const progress = progressMap.get(challenge.id);
      return {
        ...challenge,
        userProgress: progress
          ? {
              progress: progress.progress,
              completed: progress.completed,
              completedAt: progress.completedAt,
              claimed: progress.claimed,
            }
          : null,
      };
    });

    return NextResponse.json({
      success: true,
      challenges: challengesWithProgress,
    });
  } catch (error: any) {
    console.error("❌ Error fetching challenges:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// POST /api/facility-reports/challenges/claim - Claim challenge reward
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, challengeId } = body;

    if (!userId || !challengeId) {
      return NextResponse.json(
        {
          success: false,
          error: "userId and challengeId are required",
        },
        { status: 400 }
      );
    }

    // Get user challenge
    const userChallenge = await prisma.userChallenge.findUnique({
      where: {
        userId_challengeId: { userId, challengeId },
      },
      include: {
        challenge: true,
      },
    });

    if (!userChallenge) {
      return NextResponse.json(
        {
          success: false,
          error: "Challenge not found",
        },
        { status: 404 }
      );
    }

    if (!userChallenge.completed) {
      return NextResponse.json(
        {
          success: false,
          error: "Challenge not completed",
        },
        { status: 400 }
      );
    }

    if (userChallenge.claimed) {
      return NextResponse.json(
        {
          success: false,
          error: "Reward already claimed",
        },
        { status: 400 }
      );
    }

    // Mark as claimed
    await prisma.userChallenge.update({
      where: {
        userId_challengeId: { userId, challengeId },
      },
      data: {
        claimed: true,
        claimedAt: new Date(),
      },
    });

    // Add rewards to user stats
    const rewards = {
      cashReward: userChallenge.challenge.cashReward,
      creditReward: userChallenge.challenge.creditReward,
    };

    if (rewards.cashReward > 0 || rewards.creditReward > 0) {
      await prisma.userReporterStats.update({
        where: { userId },
        data: {
          totalEarned: { increment: rewards.cashReward + rewards.creditReward },
          pendingCredits: { increment: rewards.cashReward + rewards.creditReward },
          totalBonuses: { increment: rewards.cashReward + rewards.creditReward },
        },
      });
    }

    // Award badge if specified
    let badgeAwarded = null;
    if (userChallenge.challenge.badgeReward) {
      const badge = await prisma.reporterBadge.findFirst({
        where: { id: userChallenge.challenge.badgeReward },
      });

      if (badge) {
        const existing = await prisma.userBadge.findUnique({
          where: {
            userId_badgeId: { userId, badgeId: badge.id },
          },
        });

        if (!existing) {
          await prisma.userBadge.create({
            data: {
              userId,
              badgeId: badge.id,
            },
          });
          badgeAwarded = badge;
        }
      }
    }

    return NextResponse.json({
      success: true,
      rewards,
      badgeAwarded,
    });
  } catch (error: any) {
    console.error("❌ Error claiming challenge reward:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}


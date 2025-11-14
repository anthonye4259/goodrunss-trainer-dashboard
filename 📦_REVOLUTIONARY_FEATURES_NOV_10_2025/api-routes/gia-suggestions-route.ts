/**
 * GIA Proactive Suggestions API
 * GET /api/gia/suggestions - Get proactive suggestions for trainer
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generateProactiveSuggestions, getAISuggestion } from "@/lib/gia-proactive";
import { prisma } from "@/lib/prisma";

// GET - Get proactive suggestions
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log(`🤖 Generating proactive suggestions for ${userId}...`);

    // Generate suggestions
    const suggestions = await generateProactiveSuggestions(userId);

    // Get AI-powered insight
    const [trainerData, recentActivity] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          name: true,
          hourlyRate: true,
          rating: true,
          totalSessions: true,
        },
      }),
      prisma.trainerSession.findMany({
        where: {
          trainerId: userId,
          date: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
        select: {
          status: true,
          amount: true,
        },
      }),
    ]);

    const aiSuggestion = await getAISuggestion({
      trainerData,
      recentActivity,
    });

    return NextResponse.json({
      success: true,
      data: {
        suggestions,
        count: suggestions.length,
        aiInsight: aiSuggestion,
        generatedAt: new Date().toISOString(),
      },
    });

  } catch (error: any) {
    console.error("❌ Error generating suggestions:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate suggestions"
      },
      { status: 500 }
    );
  }
}


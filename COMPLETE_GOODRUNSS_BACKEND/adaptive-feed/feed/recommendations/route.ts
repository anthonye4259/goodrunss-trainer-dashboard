import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/feed/recommendations
 * Get personalized recommendations for user
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const contentType = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Get top recommendations
    const recommendations = await prisma.recommendationScore.findMany({
      where: {
        userId,
        ...(contentType ? { content: { contentType } } : {}),
        score: { gt: 0.3 }, // Only show decent matches
      },
      include: {
        content: true,
      },
      orderBy: [
        { score: 'desc' },
        { confidence: 'desc' },
      ],
      take: limit,
    });

    return NextResponse.json({
      recommendations: recommendations.map((rec) => ({
        content: {
          id: rec.content.id,
          type: rec.content.contentType,
          title: rec.content.title,
          description: rec.content.description,
          data: rec.content.data,
          imageUrl: rec.content.imageUrl,
          actionUrl: rec.content.actionUrl,
          tags: rec.content.tags,
        },
        score: Number(rec.score),
        confidence: Number(rec.confidence),
        reason: rec.reason,
        lastUpdated: rec.lastUpdated,
      })),
      total: recommendations.length,
    });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recommendations' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/feed/recommendations
 * Manually recalculate recommendations for user
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's interaction history
    const interactions = await prisma.userInteraction.findMany({
      where: { userId },
      include: { content: true },
      orderBy: { timestamp: 'desc' },
      take: 100, // Last 100 interactions
    });

    // Get user preferences
    const preferences = await prisma.userPreference.findMany({
      where: { userId },
    });

    // Get all active content
    const allContent = await prisma.contentFeature.findMany({
      where: { isActive: true },
    });

    // Calculate scores for each content item
    for (const content of allContent) {
      let score = 0.5; // Base score
      let confidence = 0.3; // Base confidence
      let reason = 'baseline';

      // Check if user has interacted with this content
      const userInteractions = interactions.filter(
        (i) => i.contentId === content.id
      );

      if (userInteractions.length > 0) {
        const engagementScores: Record<string, number> = {
          view: 0.1,
          click: 0.3,
          like: 0.5,
          share: 0.7,
          complete: 1.0,
          dismiss: -0.5,
        };

        const avgEngagement =
          userInteractions.reduce(
            (sum, i) => sum + (engagementScores[i.interactionType] || 0),
            0
          ) / userInteractions.length;

        score = avgEngagement;
        confidence = Math.min(0.3 + userInteractions.length * 0.1, 1.0);
        reason = 'past_engagement';
      }

      // Check if content tags match user preferences
      if (content.tags && Array.isArray(content.tags)) {
        const tagPreferences = preferences.filter(
          (p) =>
            p.category === 'content_tag' &&
            (content.tags as string[]).includes(p.key)
        );

        if (tagPreferences.length > 0) {
          const avgTagScore =
            tagPreferences.reduce((sum, p) => sum + Number(p.value), 0) /
            tagPreferences.length;

          score = score * 0.6 + avgTagScore * 0.4;
          confidence = Math.min(confidence + 0.2, 1.0);
          reason = 'preference_match';
        }
      }

      // Boost recent content
      const daysSinceCreated = Math.floor(
        (Date.now() - content.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceCreated < 7) {
        score += 0.1;
        reason = 'new_content';
      }

      // Apply priority boost
      score += content.priority * 0.1;

      // Clamp score between 0 and 1
      score = Math.max(0, Math.min(1, score));

      // Update or create recommendation
      await prisma.recommendationScore.upsert({
        where: {
          userId_contentId: {
            userId,
            contentId: content.id,
          },
        },
        update: {
          score,
          confidence,
          reason,
        },
        create: {
          userId,
          contentId: content.id,
          score,
          confidence,
          reason,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Recommendations recalculated',
      processedItems: allContent.length,
    });
  } catch (error) {
    console.error('Error recalculating recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to recalculate recommendations' },
      { status: 500 }
    );
  }
}


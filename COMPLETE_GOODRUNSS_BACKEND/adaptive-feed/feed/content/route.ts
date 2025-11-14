import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/feed/content
 * Get personalized feed content for the user
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const contentType = searchParams.get('type'); // workout, tip, client, analytics, etc.

    // Start a feed session
    const feedSession = await prisma.feedSession.create({
      data: {
        userId,
        startedAt: new Date(),
      },
    });

    // Get user preferences
    const preferences = await prisma.userPreference.findMany({
      where: { userId },
    });

    // Get content features (what content is available)
    let contentQuery: any = {
      isActive: true,
    };

    if (contentType) {
      contentQuery.contentType = contentType;
    }

    const allContent = await prisma.contentFeature.findMany({
      where: contentQuery,
      include: {
        recommendations: {
          where: { userId },
        },
      },
    });

    // Get recommendation scores
    const recommendedContent = await prisma.recommendationScore.findMany({
      where: {
        userId,
        content: {
          isActive: true,
          ...(contentType ? { contentType } : {}),
        },
      },
      include: {
        content: true,
      },
      orderBy: [
        { score: 'desc' },
        { lastUpdated: 'desc' },
      ],
      skip: (page - 1) * limit,
      take: limit,
    });

    // If no recommendations yet, use default content
    let feedItems = recommendedContent;
    if (feedItems.length === 0) {
      const defaultContent = allContent
        .slice((page - 1) * limit, page * limit)
        .map((content) => ({
          id: `default-${content.id}`,
          userId,
          contentId: content.id,
          score: 0.5,
          confidence: 0.5,
          reason: 'new_user',
          lastUpdated: new Date(),
          content,
          recommendations: [],
        }));
      feedItems = defaultContent as any;
    }

    // Format response
    const feed = feedItems.map((item) => ({
      id: item.content.id,
      type: item.content.contentType,
      title: item.content.title,
      description: item.content.description,
      data: item.content.data,
      imageUrl: item.content.imageUrl,
      actionUrl: item.content.actionUrl,
      priority: item.content.priority,
      tags: item.content.tags,
      recommendationScore: Number(item.score),
      confidence: Number(item.confidence),
      reason: item.reason,
    }));

    // Update feed session
    await prisma.feedSession.update({
      where: { id: feedSession.id },
      data: {
        itemsShown: feed.length,
      },
    });

    return NextResponse.json({
      feed,
      sessionId: feedSession.id,
      page,
      limit,
      hasMore: feed.length === limit,
    });
  } catch (error) {
    console.error('Error fetching feed content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feed' },
      { status: 500 }
    );
  }
}

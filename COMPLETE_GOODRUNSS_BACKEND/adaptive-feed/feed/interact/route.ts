import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/feed/interact
 * Track user interaction with feed content
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      contentId,
      sessionId,
      interactionType, // view, click, like, share, dismiss, complete
      durationSeconds,
      metadata,
    } = body;

    if (!contentId || !interactionType) {
      return NextResponse.json(
        { error: 'Content ID and interaction type required' },
        { status: 400 }
      );
    }

    // Record interaction
    const interaction = await prisma.userInteraction.create({
      data: {
        userId,
        contentId,
        sessionId,
        interactionType,
        durationSeconds,
        metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : null,
      },
    });

    // Update feed session stats
    if (sessionId) {
      await prisma.feedSession.update({
        where: { id: sessionId },
        data: {
          itemsClicked: { increment: interactionType === 'click' ? 1 : 0 },
          itemsCompleted: { increment: interactionType === 'complete' ? 1 : 0 },
          totalTimeSpent: {
            increment: durationSeconds || 0,
          },
        },
      });
    }

    // Update or create recommendation score
    const content = await prisma.contentFeature.findUnique({
      where: { id: contentId },
    });

    if (content) {
      // Calculate engagement score
      const engagementScores: Record<string, number> = {
        view: 0.1,
        click: 0.3,
        like: 0.5,
        share: 0.7,
        complete: 1.0,
        dismiss: -0.5,
      };

      const engagementScore = engagementScores[interactionType] || 0;

      // Update recommendation score
      const existing = await prisma.recommendationScore.findUnique({
        where: {
          userId_contentId: {
            userId,
            contentId,
          },
        },
      });

      if (existing) {
        // Update existing score (weighted average)
        const newScore = Number(existing.score) * 0.7 + engagementScore * 0.3;
        const newConfidence = Math.min(Number(existing.confidence) + 0.1, 1.0);

        await prisma.recommendationScore.update({
          where: { id: existing.id },
          data: {
            score: newScore,
            confidence: newConfidence,
            reason: `${interactionType}_engagement`,
          },
        });
      } else {
        // Create new score
        await prisma.recommendationScore.create({
          data: {
            userId,
            contentId,
            score: engagementScore,
            confidence: 0.3,
            reason: `first_${interactionType}`,
          },
        });
      }

      // Update user preferences based on content tags
      if (content.tags && Array.isArray(content.tags)) {
        for (const tag of content.tags as string[]) {
          const preference = await prisma.userPreference.findFirst({
            where: {
              userId,
              category: 'content_tag',
              key: tag,
            },
          });

          if (preference) {
            const currentValue = Number(preference.value) || 0;
            const newValue = Math.min(currentValue + engagementScore, 1.0);

            await prisma.userPreference.update({
              where: { id: preference.id },
              data: {
                value: newValue.toString(),
              },
            });
          } else {
            await prisma.userPreference.create({
              data: {
                userId,
                category: 'content_tag',
                key: tag,
                value: engagementScore.toString(),
              },
            });
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      interaction,
      message: 'Interaction tracked',
    });
  } catch (error) {
    console.error('Error tracking interaction:', error);
    return NextResponse.json(
      { error: 'Failed to track interaction' },
      { status: 500 }
    );
  }
}


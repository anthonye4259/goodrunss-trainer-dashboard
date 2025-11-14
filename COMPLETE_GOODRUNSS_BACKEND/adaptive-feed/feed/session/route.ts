import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/feed/session
 * End a feed session and save analytics
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { sessionId, endedAt } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      );
    }

    const session = await prisma.feedSession.findUnique({
      where: { id: sessionId },
    });

    if (!session || session.userId !== userId) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Calculate engagement metrics
    const itemsShown = session.itemsShown || 0;
    const itemsClicked = session.itemsClicked || 0;
    const itemsCompleted = session.itemsCompleted || 0;

    const engagementRate =
      itemsShown > 0 ? itemsClicked / itemsShown : 0;
    const completionRate =
      itemsShown > 0 ? itemsCompleted / itemsShown : 0;

    // Update session
    await prisma.feedSession.update({
      where: { id: sessionId },
      data: {
        endedAt: endedAt ? new Date(endedAt) : new Date(),
        engagementRate,
        completionRate,
      },
    });

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        itemsShown,
        itemsClicked,
        itemsCompleted,
        engagementRate,
        completionRate,
        totalTimeSpent: session.totalTimeSpent,
      },
    });
  } catch (error) {
    console.error('Error ending feed session:', error);
    return NextResponse.json(
      { error: 'Failed to end session' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/feed/session?userId=xxx
 * Get feed session analytics
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get('days') || '30');

    const since = new Date();
    since.setDate(since.getDate() - days);

    const sessions = await prisma.feedSession.findMany({
      where: {
        userId,
        startedAt: { gte: since },
      },
      orderBy: { startedAt: 'desc' },
    });

    // Calculate aggregate stats
    const totalSessions = sessions.length;
    const totalItemsShown = sessions.reduce(
      (sum, s) => sum + (s.itemsShown || 0),
      0
    );
    const totalItemsClicked = sessions.reduce(
      (sum, s) => sum + (s.itemsClicked || 0),
      0
    );
    const totalItemsCompleted = sessions.reduce(
      (sum, s) => sum + (s.itemsCompleted || 0),
      0
    );
    const totalTimeSpent = sessions.reduce(
      (sum, s) => sum + (s.totalTimeSpent || 0),
      0
    );

    const avgEngagementRate =
      sessions.length > 0
        ? sessions.reduce(
            (sum, s) => sum + Number(s.engagementRate || 0),
            0
          ) / sessions.length
        : 0;

    const avgCompletionRate =
      sessions.length > 0
        ? sessions.reduce(
            (sum, s) => sum + Number(s.completionRate || 0),
            0
          ) / sessions.length
        : 0;

    return NextResponse.json({
      analytics: {
        totalSessions,
        totalItemsShown,
        totalItemsClicked,
        totalItemsCompleted,
        totalTimeSpent,
        avgEngagementRate: Math.round(avgEngagementRate * 100) / 100,
        avgCompletionRate: Math.round(avgCompletionRate * 100) / 100,
        avgSessionDuration:
          totalSessions > 0
            ? Math.round(totalTimeSpent / totalSessions)
            : 0,
      },
      sessions: sessions.slice(0, 10), // Last 10 sessions
      period: `Last ${days} days`,
    });
  } catch (error) {
    console.error('Error fetching session analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

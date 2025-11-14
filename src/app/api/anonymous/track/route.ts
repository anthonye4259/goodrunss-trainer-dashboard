import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/anonymous/track
 * Track anonymous user activity
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      sessionToken,
      contentType = 'anonymous',
      contentId,
      action, // view, like, skip, share, bookmark, book, watch, complete
      actionValue, // Duration watched (seconds), completion %, etc.
      metadata,
    } = body;

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Session token required' },
        { status: 400 }
      );
    }

    // Get anonymous session
    const session = await prisma.anonymousSession.findUnique({
      where: { sessionToken },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Check if session is expired
    if (session.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Session expired' },
        { status: 401 }
      );
    }

    // Check if session was already converted
    if (session.convertedToUserId) {
      return NextResponse.json(
        {
          error: 'Session already converted',
          userId: session.convertedToUserId,
        },
        { status: 400 }
      );
    }

    // Track interaction
    // Note: userId is required but we're tracking anonymous sessions
    // Using session ID as a temporary identifier - will be updated when user signs up
    const interaction = await prisma.userInteraction.create({
      data: {
        userId: `anonymous_${session.id}`, // Temporary ID until conversion
        contentType: contentType || 'anonymous',
        contentId: contentId || 'anonymous_browsing',
        action: action || 'view',
        actionValue: actionValue || null,
        sessionId: session.id,
        deviceType: session.deviceType,
        metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : null,
      },
    });

    // Update session last activity
    await prisma.anonymousSession.update({
      where: { id: session.id },
      data: { 
        lastActiveAt: new Date(),
        totalInteractions: { increment: 1 },
      },
    });

    // Get total interactions for this session
    const totalInteractions = await prisma.userInteraction.count({
      where: { sessionId: session.id },
    });

    return NextResponse.json({
      success: true,
      interaction,
      totalInteractions,
      message: 'Activity tracked',
    });
  } catch (error) {
    console.error('Error tracking anonymous activity:', error);
    return NextResponse.json(
      { error: 'Failed to track activity' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/anonymous/track?sessionToken=xxx
 * Get anonymous user activity history
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionToken = searchParams.get('sessionToken');

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Session token required' },
        { status: 400 }
      );
    }

    // Get session
    const session = await prisma.anonymousSession.findUnique({
      where: { sessionToken },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Get all interactions for this session
    const interactions = await prisma.userInteraction.findMany({
      where: { sessionId: session.id },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    // Calculate session stats
    const stats = {
      totalInteractions: interactions.length,
      totalDuration: interactions.reduce(
        (sum, i) => sum + (i.actionValue || 0),
        0
      ),
      sessionAge: Date.now() - session.createdAt.getTime(),
      lastActivity: session.lastActiveAt,
      actionTypes: interactions.reduce((acc, i) => {
        acc[i.action] = (acc[i.action] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    return NextResponse.json({
      session: {
        id: session.id,
        deviceType: session.deviceType,
        createdAt: session.createdAt,
        expiresAt: session.expiresAt,
        converted: !!session.convertedToUserId,
        lastActiveAt: session.lastActiveAt,
      },
      interactions: interactions.slice(0, 20).map(i => ({
        id: i.id,
        contentType: i.contentType,
        contentId: i.contentId,
        action: i.action,
        actionValue: i.actionValue,
        createdAt: i.createdAt,
        metadata: i.metadata,
      })),
      stats,
    });
  } catch (error) {
    console.error('Error fetching anonymous activity:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity' },
      { status: 500 }
    );
  }
}


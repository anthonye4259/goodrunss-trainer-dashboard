import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';

/**
 * POST /api/anonymous/session
 * Create a new anonymous session
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      deviceId,
      deviceType,
      metadata,
    } = body;

    // Generate anonymous session token
    const sessionToken = randomBytes(32).toString('hex');

    // Calculate expiration date (30 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Create anonymous session
    const session = await prisma.anonymousSession.create({
      data: {
        sessionToken,
        deviceId,
        deviceType: deviceType || 'web',
        lastActiveAt: new Date(),
        expiresAt,
        // Store user agent, IP, referrer in metadata if needed
        ...(metadata ? { utmParams: metadata } : {}),
      },
    });

    return NextResponse.json({
      success: true,
      sessionToken: session.sessionToken,
      sessionId: session.id,
      expiresAt: session.expiresAt,
      message: 'Anonymous session created',
    });
  } catch (error) {
    console.error('Error creating anonymous session:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/anonymous/session?token=xxx
 * Get anonymous session details
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionToken = searchParams.get('token');

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Session token required' },
        { status: 400 }
      );
    }

    const session = await prisma.anonymousSession.findUnique({
      where: { sessionToken },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Check if expired
    if (session.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Session expired' },
        { status: 401 }
      );
    }

    // Check if converted
    if (session.convertedToUserId) {
      return NextResponse.json({
        session,
        converted: true,
        userId: session.convertedToUserId,
      });
    }

    // Update last activity
    await prisma.anonymousSession.update({
      where: { id: session.id },
      data: { lastActiveAt: new Date() },
    });

    return NextResponse.json({
      session: {
        id: session.id,
        sessionToken: session.sessionToken,
        deviceId: session.deviceId,
        deviceType: session.deviceType,
        createdAt: session.createdAt,
        expiresAt: session.expiresAt,
        utmParams: session.utmParams,
      },
      converted: false,
    });
  } catch (error) {
    console.error('Error fetching anonymous session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch session' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/anonymous/session
 * Update anonymous session activity
 */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionToken, metadata } = body;

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Session token required' },
        { status: 400 }
      );
    }

    const session = await prisma.anonymousSession.update({
      where: { sessionToken },
      data: {
        lastActiveAt: new Date(),
        ...(metadata ? { utmParams: JSON.parse(JSON.stringify(metadata)) } : {}),
      },
    });

    return NextResponse.json({
      success: true,
      session,
    });
  } catch (error) {
    console.error('Error updating anonymous session:', error);
    return NextResponse.json(
      { error: 'Failed to update session' },
      { status: 500 }
    );
  }
}


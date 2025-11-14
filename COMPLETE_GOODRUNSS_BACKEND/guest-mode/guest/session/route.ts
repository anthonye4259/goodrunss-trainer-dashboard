import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';

// POST /api/guest/session - Create anonymous session
export async function POST(req: NextRequest) {
  try {
    const {
      deviceId,
      deviceType,
      location,
      appVersion,
      referralSource,
      utmParams,
    } = await req.json();

    // Generate unique session token
    const sessionToken = `anon_${randomBytes(32).toString('hex')}`;

    // Calculate expiration (30 days from now)
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Create anonymous session
    const session = await prisma.anonymousSession.create({
      data: {
        sessionToken,
        deviceId,
        deviceType: deviceType || 'mobile',
        location,
        appVersion,
        referralSource,
        utmParams,
        expiresAt,
      },
    });

    return NextResponse.json(
      {
        session: {
          sessionToken: session.sessionToken,
          id: session.id,
        },
        message: 'Anonymous session created',
        expiresAt: session.expiresAt,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating anonymous session:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}

// GET /api/guest/session - Get or refresh anonymous session
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionToken = searchParams.get('sessionToken');

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'sessionToken is required' },
        { status: 400 }
      );
    }

    // Find session
    const session = await prisma.anonymousSession.findUnique({
      where: { sessionToken },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found or expired' },
        { status: 404 }
      );
    }

    // Check if expired
    if (new Date() > session.expiresAt) {
      return NextResponse.json(
        { error: 'Session expired', expired: true },
        { status: 410 }
      );
    }

    // Update last active time
    await prisma.anonymousSession.update({
      where: { sessionToken },
      data: { lastActiveAt: new Date() },
    });

    return NextResponse.json({
      session: {
        id: session.id,
        sessionToken: session.sessionToken,
        hasCompletedOnboarding: session.hasCompletedOnboarding,
        onboardingStep: session.onboardingStep,
        totalInteractions: session.totalInteractions,
        contentViewed: session.contentViewed,
        convertedToUserId: session.convertedToUserId,
      },
    });
  } catch (error) {
    console.error('Error fetching session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch session' },
      { status: 500 }
    );
  }
}

// PUT /api/guest/session - Update session activity
export async function PUT(req: NextRequest) {
  try {
    const {
      sessionToken,
      totalInteractions,
      contentViewed,
      timeSpent,
      location,
    } = await req.json();

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'sessionToken is required' },
        { status: 400 }
      );
    }

    const updates: any = {
      lastActiveAt: new Date(),
    };

    if (totalInteractions !== undefined) updates.totalInteractions = totalInteractions;
    if (contentViewed !== undefined) updates.contentViewed = contentViewed;
    if (timeSpent !== undefined) updates.timeSpent = timeSpent;
    if (location) updates.location = location;

    const session = await prisma.anonymousSession.update({
      where: { sessionToken },
      data: updates,
    });

    return NextResponse.json({
      session,
      message: 'Session updated',
    });
  } catch (error) {
    console.error('Error updating session:', error);
    return NextResponse.json(
      { error: 'Failed to update session' },
      { status: 500 }
    );
  }
}


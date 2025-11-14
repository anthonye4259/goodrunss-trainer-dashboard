/**
 * POST /api/waitlist/share
 * Track when a user shares their referral code
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { referralCode, platform, url } = body;

    if (!referralCode) {
      return NextResponse.json(
        { error: 'Referral code is required' },
        { status: 400 }
      );
    }

    // Find the signup
    const signup = await prisma.waitlistSignup.findUnique({
      where: { referralCode },
    });

    if (!signup) {
      return NextResponse.json(
        { error: 'Referral code not found' },
        { status: 404 }
      );
    }

    // Increment share count
    await prisma.waitlistSignup.update({
      where: { id: signup.id },
      data: {
        shareCount: { increment: 1 },
      },
    });

    // Track share event
    await prisma.referralEvent.create({
      data: {
        signupId: signup.id,
        eventType: 'share',
        platform: platform || 'unknown',
        shareUrl: url || null,
        eventData: {
          platform,
          timestamp: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Share tracked successfully',
    });

  } catch (error) {
    console.error('Share tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track share' },
      { status: 500 }
    );
  }
}

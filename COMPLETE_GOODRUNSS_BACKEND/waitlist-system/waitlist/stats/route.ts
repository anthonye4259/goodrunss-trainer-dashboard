/**
 * GET /api/waitlist/stats?code=XXX
 * Get referral statistics for a given code
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { calculateRewards } from '@/lib/referral-utils';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json(
        { error: 'Referral code is required' },
        { status: 400 }
      );
    }

    // Get signup with referrals
    const signup = await prisma.waitlistSignup.findUnique({
      where: { referralCode: code },
      include: {
        referrals: {
          select: {
            email: true,
            name: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!signup) {
      return NextResponse.json(
        { error: 'Referral code not found' },
        { status: 404 }
      );
    }

    // Calculate current rewards
    const rewards = calculateRewards(signup.referralCount);

    return NextResponse.json({
      success: true,
      data: {
        referralCode: signup.referralCode,
        referralCount: signup.referralCount,
        tier: signup.tier,
        rewards,
        referrals: signup.referrals.map(r => ({
          name: r.name || 'Anonymous',
          joinedAt: r.createdAt,
        })),
      },
    });

  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}

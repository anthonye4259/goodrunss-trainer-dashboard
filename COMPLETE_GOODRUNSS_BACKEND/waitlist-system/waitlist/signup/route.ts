/**
 * POST /api/waitlist/signup
 * Sign up for the waitlist with optional referral code
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { 
  generateReferralCode, 
  calculateRewards, 
  generateReferralUrl, 
  isValidReferralCode 
} from '@/lib/referral-utils';
import { sendWelcomeEmail } from '@/lib/email/referral-email-service';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name, userType, referredBy, source, utm } = body;

    // Validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existing = await prisma.waitlistSignup.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      return NextResponse.json(
        { 
          error: 'Email already registered',
          referralCode: existing.referralCode,
          alreadyRegistered: true 
        },
        { status: 400 }
      );
    }

    // Generate unique referral code
    const referralCode = generateReferralCode(name, userType);

    // Validate referredBy code if provided
    let referrerId: string | null = null;
    if (referredBy && isValidReferralCode(referredBy)) {
      const referrer = await prisma.waitlistSignup.findUnique({
        where: { referralCode: referredBy },
      });

      if (referrer) {
        referrerId = referrer.id;
        
        // Increment referrer's count
        await prisma.waitlistSignup.update({
          where: { id: referrerId },
          data: { 
            referralCount: { increment: 1 },
          },
        });

        // Track referral event
        await prisma.referralEvent.create({
          data: {
            signupId: referrerId,
            eventType: 'referral_converted',
            eventData: {
              newUserEmail: email,
              newUserCode: referralCode,
            },
          },
        });
      }
    }

    // Get IP and User Agent for tracking
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Create waitlist signup
    const signup = await prisma.waitlistSignup.create({
      data: {
        email: email.toLowerCase(),
        name: name || null,
        referralCode,
        referredBy: referredBy || null,
        referredById: referrerId,
        userType: userType || 'player',
        tier: 'bronze',
        earlyAccess: true,
        ipAddress,
        userAgent,
        source: source || 'direct',
        utmSource: utm?.source || null,
        utmMedium: utm?.medium || null,
        utmCampaign: utm?.campaign || null,
      },
    });

    // Calculate initial rewards
    const rewards = calculateRewards(0);
    const referralUrl = generateReferralUrl(referralCode);

    // Send welcome email (async, don't wait)
    sendWelcomeEmail({
      email: signup.email,
      name: signup.name || undefined,
      referralCode: signup.referralCode,
      referralUrl,
      tier: rewards.tier,
      badge: rewards.badge,
    }).then(result => {
      if (result.success) {
        // Mark email as sent
        prisma.waitlistSignup.update({
          where: { id: signup.id },
          data: { emailSent: true },
        }).catch(console.error);
      }
    }).catch(console.error);

    // Track signup event
    await prisma.referralEvent.create({
      data: {
        signupId: signup.id,
        eventType: 'signup',
        eventData: {
          source,
          utm,
          hasReferrer: !!referrerId,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: signup.id,
        email: signup.email,
        name: signup.name,
        referralCode: signup.referralCode,
        referralUrl,
        tier: rewards.tier,
        badge: rewards.badge,
        rewards,
      },
    }, { status: 201 });

  } catch (error) {
    console.error('Waitlist signup error:', error);
    return NextResponse.json(
      { error: 'Failed to sign up for waitlist' },
      { status: 500 }
    );
  }
}

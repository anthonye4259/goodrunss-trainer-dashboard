/**
 * POST /api/waitlist/send-invites
 * Send referral invitations via email
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { generateReferralUrl } from '@/lib/referral-utils';
import { sendBatchReferralInvites } from '@/lib/email/referral-email-service';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { referralCode, emails, personalMessage } = body;

    if (!referralCode || !emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json(
        { error: 'Referral code and emails array are required' },
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

    // Validate email format
    const validEmails = emails.filter(email => 
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    );

    if (validEmails.length === 0) {
      return NextResponse.json(
        { error: 'No valid email addresses provided' },
        { status: 400 }
      );
    }

    // Generate referral URL
    const referralUrl = generateReferralUrl(referralCode);

    // Send batch invites
    const result = await sendBatchReferralInvites(validEmails, {
      name: signup.name || undefined,
      email: signup.email,
      referralCode,
      referralUrl,
      personalMessage,
    });

    // Track invite events
    await prisma.referralEvent.create({
      data: {
        signupId: signup.id,
        eventType: 'invites_sent',
        eventData: {
          emailCount: validEmails.length,
          successful: result.successful,
          failed: result.failed,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        sent: result.successful,
        failed: result.failed,
        total: validEmails.length,
      },
    });

  } catch (error) {
    console.error('Send invites error:', error);
    return NextResponse.json(
      { error: 'Failed to send invitations' },
      { status: 500 }
    );
  }
}

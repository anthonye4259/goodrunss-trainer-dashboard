import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT /api/safety/verify/[id]/approve - Approve or reject verification (admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { verifiedBy, approved, rejectionReason } = await req.json();

    if (!verifiedBy) {
      return NextResponse.json(
        { error: 'verifiedBy is required' },
        { status: 400 }
      );
    }

    if (!approved && !rejectionReason) {
      return NextResponse.json(
        { error: 'rejectionReason is required when rejecting' },
        { status: 400 }
      );
    }

    // Update verification
    const verification = await prisma.trainerVerification.update({
      where: { id },
      data: {
        status: approved ? 'approved' : 'rejected',
        verifiedBy,
        verifiedAt: new Date(),
        rejectionReason: approved ? null : rejectionReason,
      },
    });

    // Update trainer's verified status if approved
    if (approved) {
      await prisma.user.update({
        where: { id: verification.trainerId },
        data: {
          isVerified: true,
        },
      });
    }

    // Log moderation action
    await prisma.moderationAction.create({
      data: {
        moderatorId: verifiedBy,
        moderatorName: 'Admin',
        actionType: 'verify_trainer',
        targetType: 'user',
        targetId: verification.trainerId,
        reason: approved ? 'Verification approved' : rejectionReason!,
        isAutomated: false,
      },
    });

    // TODO: Send email to trainer about verification result

    return NextResponse.json({
      verification,
      message: approved
        ? 'Trainer verified successfully'
        : 'Verification rejected',
    });
  } catch (error: any) {
    console.error('Error processing verification:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process verification' },
      { status: 500 }
    );
  }
}


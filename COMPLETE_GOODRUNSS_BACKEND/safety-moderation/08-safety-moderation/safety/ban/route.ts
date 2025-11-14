import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/safety/ban - Ban user (admin only)
export async function POST(req: NextRequest) {
  try {
    const {
      userId,
      userEmail,
      reason,
      banType,
      duration,
      bannedBy,
      relatedReportId,
      notes,
    } = await req.json();

    if (!userId || !userEmail || !reason || !banType || !bannedBy) {
      return NextResponse.json(
        { error: 'userId, userEmail, reason, banType, and bannedBy are required' },
        { status: 400 }
      );
    }

    // Calculate expiration for temporary bans
    let expiresAt = null;
    if (banType === 'temporary' && duration) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + duration);
    }

    // Create ban
    const ban = await prisma.userBan.create({
      data: {
        userId,
        userEmail,
        reason,
        banType,
        duration,
        expiresAt,
        bannedBy,
        relatedReportId,
        notes,
      },
    });

    // Log moderation action
    await prisma.moderationAction.create({
      data: {
        moderatorId: bannedBy,
        moderatorName: 'Admin',
        actionType: 'ban_user',
        targetType: 'user',
        targetId: userId,
        reason,
        notes,
        metadata: {
          banType,
          duration,
          expiresAt,
        },
        isAutomated: false,
      },
    });

    // TODO: Send email to user about ban
    // TODO: Revoke all active sessions

    return NextResponse.json({
      ban,
      message: 'User banned successfully',
    });
  } catch (error: any) {
    console.error('Error banning user:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to ban user' },
      { status: 500 }
    );
  }
}

// DELETE /api/safety/ban - Lift ban (admin only)
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const liftedBy = searchParams.get('liftedBy');
    const liftReason = searchParams.get('liftReason');

    if (!userId || !liftedBy) {
      return NextResponse.json(
        { error: 'userId and liftedBy are required' },
        { status: 400 }
      );
    }

    // Update ban
    const ban = await prisma.userBan.update({
      where: { userId },
      data: {
        isActive: false,
        liftedAt: new Date(),
        liftedBy,
        liftReason,
      },
    });

    // Log moderation action
    await prisma.moderationAction.create({
      data: {
        moderatorId: liftedBy,
        moderatorName: 'Admin',
        actionType: 'lift_ban',
        targetType: 'user',
        targetId: userId,
        reason: liftReason || 'Ban lifted',
        isAutomated: false,
      },
    });

    return NextResponse.json({
      ban,
      message: 'Ban lifted successfully',
    });
  } catch (error: any) {
    console.error('Error lifting ban:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to lift ban' },
      { status: 500 }
    );
  }
}

// GET /api/safety/ban - Check if user is banned
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const ban = await prisma.userBan.findUnique({
      where: { userId },
    });

    if (!ban || !ban.isActive) {
      return NextResponse.json({
        isBanned: false,
      });
    }

    // Check if temporary ban expired
    if (ban.banType === 'temporary' && ban.expiresAt && ban.expiresAt < new Date()) {
      // Auto-lift expired ban
      await prisma.userBan.update({
        where: { userId },
        data: {
          isActive: false,
          liftedAt: new Date(),
          liftReason: 'Ban expired',
        },
      });

      return NextResponse.json({
        isBanned: false,
      });
    }

    return NextResponse.json({
      isBanned: true,
      ban,
    });
  } catch (error: any) {
    console.error('Error checking ban:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check ban' },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/waitlist - Player joins waitlist for a fully booked trainer
export async function POST(req: NextRequest) {
  try {
    const {
      trainerId,
      playerId,
      playerEmail,
      playerPhone,
      desiredDate,
      desiredTimeSlot,
      sessionType,
      duration,
      notes,
      notifyViaSMS,
      notifyViaEmail,
      notifyViaPush,
    } = await req.json();

    if (!trainerId || !playerId || !playerEmail) {
      return NextResponse.json(
        { error: 'trainerId, playerId, and playerEmail are required' },
        { status: 400 }
      );
    }

    // Check if already on waitlist
    const existing = await prisma.bookingWaitlist.findFirst({
      where: {
        trainerId,
        playerId,
        status: 'active',
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Already on waitlist for this trainer' },
        { status: 400 }
      );
    }

    // Add to waitlist
    const waitlist = await prisma.bookingWaitlist.create({
      data: {
        trainerId,
        playerId,
        playerEmail,
        playerPhone,
        desiredDate: desiredDate ? new Date(desiredDate) : null,
        desiredTimeSlot,
        sessionType,
        duration: duration || 60,
        notes,
        notifyViaSMS: notifyViaSMS !== undefined ? notifyViaSMS : false,
        notifyViaEmail: notifyViaEmail !== undefined ? notifyViaEmail : true,
        notifyViaPush: notifyViaPush !== undefined ? notifyViaPush : true,
        status: 'active',
        priority: 0,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    return NextResponse.json(
      {
        waitlist,
        message: 'Successfully added to waitlist. You will be notified when a spot opens up.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding to waitlist:', error);
    return NextResponse.json(
      { error: 'Failed to add to waitlist' },
      { status: 500 }
    );
  }
}

// GET /api/waitlist - Get waitlist entries (for trainer or player)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const trainerId = searchParams.get('trainerId');
    const playerId = searchParams.get('playerId');
    const status = searchParams.get('status') || 'active';

    if (!trainerId && !playerId) {
      return NextResponse.json(
        { error: 'Either trainerId or playerId is required' },
        { status: 400 }
      );
    }

    const where: any = { status };
    if (trainerId) where.trainerId = trainerId;
    if (playerId) where.playerId = playerId;

    const waitlist = await prisma.bookingWaitlist.findMany({
      where,
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'asc' },
      ],
    });

    return NextResponse.json({
      waitlist,
      count: waitlist.length,
    });
  } catch (error) {
    console.error('Error fetching waitlist:', error);
    return NextResponse.json(
      { error: 'Failed to fetch waitlist' },
      { status: 500 }
    );
  }
}

// DELETE /api/waitlist?id={waitlistId} - Remove from waitlist
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Waitlist ID is required' },
        { status: 400 }
      );
    }

    await prisma.bookingWaitlist.update({
      where: { id },
      data: { status: 'cancelled' },
    });

    return NextResponse.json({
      message: 'Removed from waitlist',
    });
  } catch (error) {
    console.error('Error removing from waitlist:', error);
    return NextResponse.json(
      { error: 'Failed to remove from waitlist' },
      { status: 500 }
    );
  }
}


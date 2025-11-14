import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/ambassador-program/rewards/approve - Approve reward for payout
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { rewardId, approvedBy, action = 'approve' } = body; // approve or pay

    if (!rewardId || !approvedBy) {
      return NextResponse.json(
        { success: false, error: 'Reward ID and approver required' },
        { status: 400 }
      );
    }

    // Get reward
    const rewards = await prisma.$queryRawUnsafe(`
      SELECT * FROM program_rewards WHERE id = $1
    `, rewardId) as any[];

    if (rewards.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Reward not found' },
        { status: 404 }
      );
    }

    const reward = rewards[0];

    if (action === 'approve') {
      if (reward.status !== 'pending') {
        return NextResponse.json(
          { success: false, error: 'Reward already processed' },
          { status: 400 }
        );
      }

      // Approve reward
      await prisma.$queryRawUnsafe(`
        UPDATE program_rewards
        SET status = 'approved', approved_by = $1, approved_at = NOW()
        WHERE id = $2
      `, approvedBy, rewardId);

      return NextResponse.json({ 
        success: true, 
        message: 'Reward approved'
      });

    } else if (action === 'pay') {
      if (reward.status !== 'approved') {
        return NextResponse.json(
          { success: false, error: 'Reward must be approved first' },
          { status: 400 }
        );
      }

      // Mark as paid
      await prisma.$queryRawUnsafe(`
        UPDATE program_rewards
        SET status = 'paid', paid_at = NOW()
        WHERE id = $1
      `, rewardId);

      return NextResponse.json({ 
        success: true, 
        message: 'Reward marked as paid'
      });

    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error processing reward:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process reward' },
      { status: 500 }
    );
  }
}


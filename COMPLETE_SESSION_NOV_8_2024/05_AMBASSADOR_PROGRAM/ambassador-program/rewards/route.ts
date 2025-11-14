import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/ambassador-program/rewards - Create a reward
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      userId,
      roleId,
      rewardType, // commission, bonus, prize, swag
      amount,
      description,
      relatedTo
    } = body;

    if (!userId || !roleId || !rewardType || !description) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get member
    const members = await prisma.$queryRawUnsafe(`
      SELECT * FROM program_members
      WHERE user_id = $1 AND role_id = $2
      LIMIT 1
    `, userId, roleId) as any[];

    const memberId = members.length > 0 ? members[0].id : null;

    const rewardId = `rew_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create reward
    await prisma.$queryRawUnsafe(`
      INSERT INTO program_rewards (
        id, user_id, member_id, role_id, reward_type, amount, currency,
        description, related_to, status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
    `, 
      rewardId,
      userId,
      memberId,
      roleId,
      rewardType,
      amount || 0,
      'USD',
      description,
      relatedTo || null,
      'pending'
    );

    const reward = await prisma.$queryRawUnsafe(`
      SELECT * FROM program_rewards WHERE id = $1
    `, rewardId) as any[];

    return NextResponse.json({ 
      success: true, 
      reward: reward[0]
    });

  } catch (error) {
    console.error('Error creating reward:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create reward' },
      { status: 500 }
    );
  }
}

// GET /api/ambassador-program/rewards?userId=xxx - Get user's rewards
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 400 }
      );
    }

    let query = `
      SELECT 
        r.*,
        pr.name as role_name,
        pr.icon as role_icon
      FROM program_rewards r
      JOIN program_roles pr ON r.role_id = pr.id
      WHERE r.user_id = $1
    `;

    const params: any[] = [userId];

    if (status) {
      query += ` AND r.status = $2`;
      params.push(status);
    }

    query += ` ORDER BY r.created_at DESC`;

    const rewards = await prisma.$queryRawUnsafe(query, ...params) as any[];

    // Calculate totals
    const totals = {
      pending: 0,
      approved: 0,
      paid: 0
    };

    rewards.forEach((reward: any) => {
      const amount = parseFloat(reward.amount) || 0;
      if (reward.status === 'pending') totals.pending += amount;
      if (reward.status === 'approved') totals.approved += amount;
      if (reward.status === 'paid') totals.paid += amount;
    });

    return NextResponse.json({ 
      success: true, 
      rewards,
      totals
    });

  } catch (error) {
    console.error('Error fetching rewards:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch rewards' },
      { status: 500 }
    );
  }
}


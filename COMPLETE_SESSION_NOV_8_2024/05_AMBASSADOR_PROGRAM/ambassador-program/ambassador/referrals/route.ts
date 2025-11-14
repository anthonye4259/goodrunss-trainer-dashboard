import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/ambassador-program/ambassador/referrals - Track a referral
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      referralCode,
      referredUserId,
      referralSource // social, event, direct, etc.
    } = body;

    if (!referralCode || !referredUserId) {
      return NextResponse.json(
        { success: false, error: 'Referral code and referred user ID required' },
        { status: 400 }
      );
    }

    // Get ambassador by code
    const ambassadors = await prisma.$queryRawUnsafe(`
      SELECT * FROM ambassadors
      WHERE ambassador_code = $1
      LIMIT 1
    `, referralCode) as any[];

    if (ambassadors.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid referral code' },
        { status: 404 }
      );
    }

    const ambassador = ambassadors[0];

    // Check if this user was already referred
    const existingReferrals = await prisma.$queryRawUnsafe(`
      SELECT * FROM ambassador_referrals
      WHERE referred_user_id = $1
      LIMIT 1
    `, referredUserId) as any[];

    if (existingReferrals.length > 0) {
      return NextResponse.json(
        { success: false, error: 'User was already referred' },
        { status: 400 }
      );
    }

    const referralId = `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create referral
    await prisma.$queryRawUnsafe(`
      INSERT INTO ambassador_referrals (
        id, ambassador_id, referred_user_id, referral_code,
        referral_source, status, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
    `, 
      referralId,
      ambassador.id,
      referredUserId,
      referralCode,
      referralSource || 'direct',
      'pending'
    );

    // Update ambassador stats
    await prisma.$queryRawUnsafe(`
      UPDATE ambassadors
      SET total_referrals = total_referrals + 1, last_referral_at = NOW()
      WHERE id = $1
    `, ambassador.id);

    // Log activity
    const activityId = `act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await prisma.$queryRawUnsafe(`
      INSERT INTO program_activity (
        id, user_id, member_id, role_id, activity_type, activity_data, points_earned, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, NOW())
    `, 
      activityId,
      ambassador.user_id,
      ambassador.member_id,
      'ambassador',
      'referral_made',
      JSON.stringify({ referralId, referredUserId }),
      10 // 10 points per referral
    );

    const referral = await prisma.$queryRawUnsafe(`
      SELECT * FROM ambassador_referrals WHERE id = $1
    `, referralId) as any[];

    return NextResponse.json({ 
      success: true, 
      referral: referral[0]
    });

  } catch (error) {
    console.error('Error tracking referral:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to track referral' },
      { status: 500 }
    );
  }
}

// GET /api/ambassador-program/ambassador/referrals?userId=xxx - Get user's referrals
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
      SELECT r.*
      FROM ambassador_referrals r
      JOIN ambassadors a ON r.ambassador_id = a.id
      WHERE a.user_id = $1
    `;

    const params: any[] = [userId];

    if (status) {
      query += ` AND r.status = $2`;
      params.push(status);
    }

    query += ` ORDER BY r.created_at DESC`;

    const referrals = await prisma.$queryRawUnsafe(query, ...params) as any[];

    return NextResponse.json({ 
      success: true, 
      referrals 
    });

  } catch (error) {
    console.error('Error fetching referrals:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch referrals' },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/ambassador-program/court-captain/assign - Assign facility to captain
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, facilityId, sport } = body;

    if (!userId || !facilityId || !sport) {
      return NextResponse.json(
        { success: false, error: 'User ID, Facility ID, and Sport required' },
        { status: 400 }
      );
    }

    // Check if user is a court captain
    const members = await prisma.$queryRawUnsafe(`
      SELECT * FROM program_members
      WHERE user_id = $1 AND role_id = 'court-captain' AND status = 'active'
      LIMIT 1
    `, userId) as any[];

    if (members.length === 0) {
      return NextResponse.json(
        { success: false, error: 'User is not an active court captain' },
        { status: 400 }
      );
    }

    const member = members[0];

    // Check if this facility is already assigned to another captain
    const existingAssignments = await prisma.$queryRawUnsafe(`
      SELECT * FROM court_captains
      WHERE facility_id = $1 AND sport = $2 AND status = 'active'
      LIMIT 1
    `, facilityId, sport) as any[];

    if (existingAssignments.length > 0 && existingAssignments[0].user_id !== userId) {
      return NextResponse.json(
        { success: false, error: 'This facility is already assigned to another captain' },
        { status: 400 }
      );
    }

    // Check if user already has this facility
    const userAssignments = await prisma.$queryRawUnsafe(`
      SELECT * FROM court_captains
      WHERE user_id = $1 AND facility_id = $2 AND sport = $3
      LIMIT 1
    `, userId, facilityId, sport) as any[];

    if (userAssignments.length > 0) {
      return NextResponse.json(
        { success: false, error: 'You are already assigned to this facility' },
        { status: 400 }
      );
    }

    // Create assignment
    const captainId = `cap_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await prisma.$queryRawUnsafe(`
      INSERT INTO court_captains (
        id, user_id, member_id, facility_id, sport, status,
        total_reports, quality_score, consistency_score,
        priority_booking, free_bookings_per_month, discount_percentage,
        assigned_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
    `, 
      captainId, 
      userId, 
      member.id, 
      facilityId, 
      sport,
      'active',
      0,
      0.00,
      0.00,
      true,
      1, // 1 free booking per month (Bronze tier)
      10 // 10% discount (Bronze tier)
    );

    const assignment = await prisma.$queryRawUnsafe(`
      SELECT * FROM court_captains WHERE id = $1
    `, captainId) as any[];

    return NextResponse.json({ 
      success: true, 
      assignment: assignment[0]
    });

  } catch (error) {
    console.error('Error assigning facility:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to assign facility' },
      { status: 500 }
    );
  }
}

// GET /api/ambassador-program/court-captain/assign?userId=xxx - Get user's assignments
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 400 }
      );
    }

    const assignments = await prisma.$queryRawUnsafe(`
      SELECT 
        cc.*,
        f.name as facility_name,
        f.address as facility_address,
        f.sport_type as facility_type
      FROM court_captains cc
      LEFT JOIN facilities f ON cc.facility_id = f.id
      WHERE cc.user_id = $1
      ORDER BY cc.assigned_at DESC
    `, userId) as any[];

    return NextResponse.json({ 
      success: true, 
      assignments 
    });

  } catch (error) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch assignments' },
      { status: 500 }
    );
  }
}


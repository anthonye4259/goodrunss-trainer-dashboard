import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/ambassador-program/dashboard?userId=xxx - Get user's program dashboard
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

    // Get all memberships
    const memberships = await prisma.$queryRawUnsafe(`
      SELECT 
        m.*,
        r.name as role_name,
        r.description as role_description,
        r.icon as role_icon,
        t.tier_name,
        t.tier_level,
        t.perks
      FROM program_members m
      JOIN program_roles r ON m.role_id = r.id
      LEFT JOIN role_tiers t ON m.tier_id = t.id
      WHERE m.user_id = $1
      ORDER BY m.joined_at DESC
    `, userId) as any[];

    const dashboard: Record<string, any> = {
      memberships,
      roles: {} as any
    };

    // Get detailed stats for each role
    for (const membership of memberships) {
      if (membership.role_id === 'court-captain') {
        // Court Captain stats
        const captainData = await prisma.$queryRawUnsafe(`
          SELECT 
            COUNT(*) as total_facilities,
            SUM(total_reports) as total_reports,
            AVG(quality_score) as avg_quality_score,
            AVG(consistency_score) as avg_consistency_score,
            SUM(free_bookings_per_month) as free_bookings
          FROM court_captains
          WHERE user_id = $1 AND status = 'active'
        `, userId) as any[];

        const facilities = await prisma.$queryRawUnsafe(`
          SELECT 
            cc.*,
            f.name as facility_name,
            f.address as facility_address
          FROM court_captains cc
          LEFT JOIN facilities f ON cc.facility_id = f.id
          WHERE cc.user_id = $1 AND cc.status = 'active'
          ORDER BY cc.last_report_at DESC
        `, userId) as any[];

        dashboard.roles['court-captain'] = {
          ...captainData[0],
          facilities
        };

      } else if (membership.role_id === 'ugc-creator') {
        // UGC Creator stats
        const creatorData = await prisma.$queryRawUnsafe(`
          SELECT * FROM ugc_creators
          WHERE user_id = $1
          LIMIT 1
        `, userId) as any[];

        const recentContent = await prisma.$queryRawUnsafe(`
          SELECT c.*
          FROM ugc_content c
          JOIN ugc_creators cr ON c.creator_id = cr.id
          WHERE cr.user_id = $1
          ORDER BY c.created_at DESC
          LIMIT 10
        `, userId) as any[];

        dashboard.roles['ugc-creator'] = {
          ...creatorData[0],
          recentContent
        };

      } else if (membership.role_id === 'ambassador') {
        // Ambassador stats
        const ambassadorData = await prisma.$queryRawUnsafe(`
          SELECT * FROM ambassadors
          WHERE user_id = $1
          LIMIT 1
        `, userId) as any[];

        const recentReferrals = await prisma.$queryRawUnsafe(`
          SELECT r.*
          FROM ambassador_referrals r
          JOIN ambassadors a ON r.ambassador_id = a.id
          WHERE a.user_id = $1
          ORDER BY r.created_at DESC
          LIMIT 10
        `, userId) as any[];

        const upcomingEvents = await prisma.$queryRawUnsafe(`
          SELECT e.*
          FROM ambassador_events e
          JOIN ambassadors a ON e.ambassador_id = a.id
          WHERE a.user_id = $1 AND e.event_date > NOW()
          ORDER BY e.event_date ASC
          LIMIT 5
        `, userId) as any[];

        dashboard.roles['ambassador'] = {
          ...ambassadorData[0],
          recentReferrals,
          upcomingEvents
        };
      }
    }

    // Get recent activity
    const recentActivity = await prisma.$queryRawUnsafe(`
      SELECT *
      FROM program_activity
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 20
    `, userId) as any[];

    dashboard['recentActivity'] = recentActivity;

    // Get pending rewards
    const pendingRewards = await prisma.$queryRawUnsafe(`
      SELECT *
      FROM program_rewards
      WHERE user_id = $1 AND status IN ('pending', 'approved')
      ORDER BY created_at DESC
    `, userId) as any[];

    dashboard['pendingRewards'] = pendingRewards;

    // Calculate total earnings across all roles
    const totalEarnings = await prisma.$queryRawUnsafe(`
      SELECT 
        COALESCE(SUM(amount), 0) as total_paid
      FROM program_rewards
      WHERE user_id = $1 AND status = 'paid'
    `, userId) as any[];

    dashboard['totalEarnings'] = totalEarnings[0]?.total_paid || 0;

    return NextResponse.json({ 
      success: true, 
      dashboard 
    });

  } catch (error) {
    console.error('Error fetching dashboard:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard' },
      { status: 500 }
    );
  }
}


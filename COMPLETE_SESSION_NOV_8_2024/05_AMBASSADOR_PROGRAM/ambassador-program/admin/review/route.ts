import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/ambassador-program/admin/review - Approve or reject application
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      applicationId, 
      action, // 'approve' or 'reject'
      reviewedBy,
      rejectionReason,
      tierLevel = 1 // Default to Bronze
    } = body;

    if (!applicationId || !action || !reviewedBy) {
      return NextResponse.json(
        { success: false, error: 'Application ID, action, and reviewer required' },
        { status: 400 }
      );
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Action must be approve or reject' },
        { status: 400 }
      );
    }

    // Get application
    const applications = await prisma.$queryRawUnsafe(`
      SELECT * FROM ambassador_applications WHERE id = $1
    `, applicationId) as any[];

    if (applications.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      );
    }

    const application = applications[0];

    if (application.status !== 'pending') {
      return NextResponse.json(
        { success: false, error: 'Application already reviewed' },
        { status: 400 }
      );
    }

    if (action === 'approve') {
      // Get tier for this role
      const tiers = await prisma.$queryRawUnsafe(`
        SELECT * FROM role_tiers 
        WHERE role_id = $1 AND tier_level = $2
        LIMIT 1
      `, application.role_id, tierLevel) as any[];

      const tier = tiers[0];

      // Create program member
      const memberId = `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      await prisma.$queryRawUnsafe(`
        INSERT INTO program_members (
          id, user_id, role_id, tier_id, status, points, level, tier_level,
          joined_at, tier_updated_at, last_active_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW(), NOW())
      `, 
        memberId,
        application.user_id,
        application.role_id,
        tier?.id || null,
        'active',
        0,
        1,
        tierLevel
      );

      // Create role-specific record
      if (application.role_id === 'court-captain') {
        // Create court captain record (facilities will be assigned later)
        const captainId = `cap_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await prisma.$queryRawUnsafe(`
          INSERT INTO court_captains (
            id, user_id, member_id, facility_id, sport, status, assigned_at
          ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
        `, captainId, application.user_id, memberId, 'pending-assignment', 'multi', 'active');

      } else if (application.role_id === 'ugc-creator') {
        // Create UGC creator record
        const creatorId = `cre_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const appData = typeof application.application_data === 'string' 
          ? JSON.parse(application.application_data) 
          : application.application_data;

        await prisma.$queryRawUnsafe(`
          INSERT INTO ugc_creators (
            id, user_id, member_id, creator_name, bio, social_handles,
            content_categories, commission_rate, joined_at
          ) VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8, NOW())
        `, 
          creatorId, 
          application.user_id, 
          memberId,
          appData?.creatorName || null,
          appData?.bio || null,
          JSON.stringify(application.social_links || {}),
          appData?.categories || [],
          5.00 // 5% commission
        );

      } else if (application.role_id === 'ambassador') {
        // Create ambassador record with unique code
        const ambassadorId = `amb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const ambassadorCode = `GR${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
        const appData = typeof application.application_data === 'string' 
          ? JSON.parse(application.application_data) 
          : application.application_data;

        await prisma.$queryRawUnsafe(`
          INSERT INTO ambassadors (
            id, user_id, member_id, ambassador_code, territory, focus_sports,
            commission_rate, swag_tier, joined_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
        `, 
          ambassadorId, 
          application.user_id, 
          memberId,
          ambassadorCode,
          appData?.territory || null,
          appData?.sports || [],
          10.00, // 10% commission
          'basic'
        );
      }

      // Update application status
      await prisma.$queryRawUnsafe(`
        UPDATE ambassador_applications 
        SET status = 'approved', reviewed_by = $1, reviewed_at = NOW(), updated_at = NOW()
        WHERE id = $2
      `, reviewedBy, applicationId);

      return NextResponse.json({ 
        success: true, 
        message: 'Application approved',
        memberId
      });

    } else {
      // Reject application
      await prisma.$queryRawUnsafe(`
        UPDATE ambassador_applications 
        SET status = 'rejected', reviewed_by = $1, reviewed_at = NOW(), 
            rejection_reason = $2, updated_at = NOW()
        WHERE id = $3
      `, reviewedBy, rejectionReason || null, applicationId);

      return NextResponse.json({ 
        success: true, 
        message: 'Application rejected'
      });
    }

  } catch (error) {
    console.error('Error reviewing application:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to review application' },
      { status: 500 }
    );
  }
}

// GET /api/ambassador-program/admin/review - Get pending applications
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'pending';
    const roleId = searchParams.get('roleId');

    let query = `
      SELECT 
        a.*,
        r.name as role_name,
        r.description as role_description,
        r.icon as role_icon
      FROM ambassador_applications a
      JOIN program_roles r ON a.role_id = r.id
      WHERE a.status = $1
    `;

    const params: any[] = [status];

    if (roleId) {
      query += ` AND a.role_id = $2`;
      params.push(roleId);
    }

    query += ` ORDER BY a.created_at DESC`;

    const applications = await prisma.$queryRawUnsafe(query, ...params) as any[];

    return NextResponse.json({ 
      success: true, 
      applications,
      total: applications.length
    });

  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}


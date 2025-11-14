import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/ambassador-program/apply - Submit application
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      userId, 
      roleId, 
      motivation,
      applicationData,
      socialLinks,
      portfolioUrl,
      referralCode
    } = body;

    if (!userId || !roleId) {
      return NextResponse.json(
        { success: false, error: 'User ID and Role ID required' },
        { status: 400 }
      );
    }

    // Check if user already has an active application for this role
    const existingApplication = await prisma.$queryRawUnsafe(`
      SELECT * FROM ambassador_applications
      WHERE user_id = $1 AND role_id = $2 AND status = 'pending'
      LIMIT 1
    `, userId, roleId) as any[];

    if (existingApplication.length > 0) {
      return NextResponse.json(
        { success: false, error: 'You already have a pending application for this role' },
        { status: 400 }
      );
    }

    // Check if user is already a member of this program
    const existingMember = await prisma.$queryRawUnsafe(`
      SELECT * FROM program_members
      WHERE user_id = $1 AND role_id = $2 AND status = 'active'
      LIMIT 1
    `, userId, roleId) as any[];

    if (existingMember.length > 0) {
      return NextResponse.json(
        { success: false, error: 'You are already a member of this program' },
        { status: 400 }
      );
    }

    const applicationId = `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create application
    await prisma.$queryRawUnsafe(`
      INSERT INTO ambassador_applications (
        id, user_id, role_id, status, application_data, motivation,
        social_links, portfolio_url, referral_code, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7::jsonb, $8, $9, NOW(), NOW())
    `, 
      applicationId, 
      userId, 
      roleId, 
      'pending',
      JSON.stringify(applicationData || {}),
      motivation || null,
      JSON.stringify(socialLinks || {}),
      portfolioUrl || null,
      referralCode || null
    );

    const application = await prisma.$queryRawUnsafe(`
      SELECT * FROM ambassador_applications WHERE id = $1
    `, applicationId) as any[];

    return NextResponse.json({ 
      success: true, 
      application: application[0]
    });

  } catch (error) {
    console.error('Error submitting application:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit application' },
      { status: 500 }
    );
  }
}

// GET /api/ambassador-program/apply?userId=xxx - Get user's applications
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

    const applications = await prisma.$queryRawUnsafe(`
      SELECT 
        a.*,
        r.name as role_name,
        r.description as role_description,
        r.icon as role_icon
      FROM ambassador_applications a
      JOIN program_roles r ON a.role_id = r.id
      WHERE a.user_id = $1
      ORDER BY a.created_at DESC
    `, userId) as any[];

    return NextResponse.json({ 
      success: true, 
      applications 
    });

  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}


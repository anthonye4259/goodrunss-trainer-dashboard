import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/ambassador-program/ugc/moderate - Approve or reject content
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      contentId, 
      action, // 'approve' or 'reject'
      moderatedBy,
      rejectionReason,
      featured = false
    } = body;

    if (!contentId || !action || !moderatedBy) {
      return NextResponse.json(
        { success: false, error: 'Content ID, action, and moderator required' },
        { status: 400 }
      );
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Action must be approve or reject' },
        { status: 400 }
      );
    }

    // Get content
    const contents = await prisma.$queryRawUnsafe(`
      SELECT * FROM ugc_content WHERE id = $1
    `, contentId) as any[];

    if (contents.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Content not found' },
        { status: 404 }
      );
    }

    const content = contents[0];

    if (content.status !== 'pending') {
      return NextResponse.json(
        { success: false, error: 'Content already moderated' },
        { status: 400 }
      );
    }

    if (action === 'approve') {
      // Approve content
      await prisma.$queryRawUnsafe(`
        UPDATE ugc_content 
        SET status = 'approved', moderated_by = $1, moderated_at = NOW(), 
            published_at = NOW(), updated_at = NOW()
        WHERE id = $2
      `, moderatedBy, contentId);

      // If featured, update creator
      if (featured) {
        await prisma.$queryRawUnsafe(`
          UPDATE ugc_creators
          SET featured_creator = true
          WHERE id = $1
        `, content.creator_id);
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Content approved and published'
      });

    } else {
      // Reject content
      await prisma.$queryRawUnsafe(`
        UPDATE ugc_content 
        SET status = 'rejected', moderated_by = $1, moderated_at = NOW(), 
            rejection_reason = $2, updated_at = NOW()
        WHERE id = $3
      `, moderatedBy, rejectionReason || null, contentId);

      return NextResponse.json({ 
        success: true, 
        message: 'Content rejected'
      });
    }

  } catch (error) {
    console.error('Error moderating content:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to moderate content' },
      { status: 500 }
    );
  }
}

// GET /api/ambassador-program/ugc/moderate - Get pending content
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'pending';

    const content = await prisma.$queryRawUnsafe(`
      SELECT 
        c.*,
        cr.creator_name,
        cr.user_id
      FROM ugc_content c
      JOIN ugc_creators cr ON c.creator_id = cr.id
      WHERE c.status = $1
      ORDER BY c.created_at DESC
    `, status) as any[];

    return NextResponse.json({ 
      success: true, 
      content,
      total: content.length
    });

  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/ambassador-program/ugc/submit - Submit UGC content
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      userId,
      contentType, // video, photo, review, drill, tip
      title,
      description,
      contentUrl,
      thumbnailUrl,
      sport,
      skillLevel,
      duration,
      tags
    } = body;

    if (!userId || !contentType || !title || !contentUrl) {
      return NextResponse.json(
        { success: false, error: 'User ID, content type, title, and content URL required' },
        { status: 400 }
      );
    }

    // Check if user is a UGC creator
    const creators = await prisma.$queryRawUnsafe(`
      SELECT * FROM ugc_creators
      WHERE user_id = $1
      LIMIT 1
    `, userId) as any[];

    if (creators.length === 0) {
      return NextResponse.json(
        { success: false, error: 'User is not a UGC creator' },
        { status: 400 }
      );
    }

    const creator = creators[0];
    const contentId = `con_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create content
    await prisma.$queryRawUnsafe(`
      INSERT INTO ugc_content (
        id, creator_id, content_type, title, description,
        content_url, thumbnail_url, sport, skill_level, duration,
        tags, status, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
    `, 
      contentId,
      creator.id,
      contentType,
      title,
      description || null,
      contentUrl,
      thumbnailUrl || null,
      sport || null,
      skillLevel || null,
      duration || null,
      tags || [],
      'pending' // Pending moderation
    );

    // Update creator stats
    await prisma.$queryRawUnsafe(`
      UPDATE ugc_creators
      SET total_content = total_content + 1, last_post_at = NOW()
      WHERE id = $1
    `, creator.id);

    // Log activity
    const activityId = `act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await prisma.$queryRawUnsafe(`
      INSERT INTO program_activity (
        id, user_id, member_id, role_id, activity_type, activity_data, points_earned, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, NOW())
    `, 
      activityId,
      userId,
      creator.member_id,
      'ugc-creator',
      'content_posted',
      JSON.stringify({ contentId, contentType, title }),
      10 // 10 points for content submission
    );

    const content = await prisma.$queryRawUnsafe(`
      SELECT * FROM ugc_content WHERE id = $1
    `, contentId) as any[];

    return NextResponse.json({ 
      success: true, 
      content: content[0],
      message: 'Content submitted for moderation'
    });

  } catch (error) {
    console.error('Error submitting content:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit content' },
      { status: 500 }
    );
  }
}

// GET /api/ambassador-program/ugc/submit?userId=xxx - Get user's content
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status'); // pending, approved, rejected

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 400 }
      );
    }

    let query = `
      SELECT c.*
      FROM ugc_content c
      JOIN ugc_creators cr ON c.creator_id = cr.id
      WHERE cr.user_id = $1
    `;

    const params: any[] = [userId];

    if (status) {
      query += ` AND c.status = $2`;
      params.push(status);
    }

    query += ` ORDER BY c.created_at DESC`;

    const content = await prisma.$queryRawUnsafe(query, ...params) as any[];

    return NextResponse.json({ 
      success: true, 
      content 
    });

  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}


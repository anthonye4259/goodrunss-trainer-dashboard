import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/gia/library
 * Get user's saved AI-generated content
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const contentType = searchParams.get('type');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: any = { userId };
    if (contentType) {
      where.contentType = contentType;
    }

    const content = await prisma.giaContent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.giaContent.count({ where });

    return NextResponse.json({
      content,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching content library:', error);
    return NextResponse.json(
      { error: 'Failed to fetch library' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/gia/library?contentId=xxx
 * Delete a piece of generated content
 */
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const contentId = searchParams.get('contentId');

    if (!contentId) {
      return NextResponse.json(
        { error: 'Content ID required' },
        { status: 400 }
      );
    }

    // Verify ownership
    const content = await prisma.giaContent.findUnique({
      where: { id: contentId },
    });

    if (!content || content.userId !== userId) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
    }

    await prisma.giaContent.delete({
      where: { id: contentId },
    });

    return NextResponse.json({
      success: true,
      message: 'Content deleted',
    });
  } catch (error) {
    console.error('Error deleting content:', error);
    return NextResponse.json(
      { error: 'Failed to delete content' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/gia/library
 * Update generated content (edit or favorite)
 */
export async function PUT(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { contentId, generatedContent, isFavorite } = body;

    if (!contentId) {
      return NextResponse.json(
        { error: 'Content ID required' },
        { status: 400 }
      );
    }

    // Verify ownership
    const content = await prisma.giaContent.findUnique({
      where: { id: contentId },
    });

    if (!content || content.userId !== userId) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
    }

    const updated = await prisma.giaContent.update({
      where: { id: contentId },
      data: {
        ...(generatedContent !== undefined ? { generatedContent } : {}),
        ...(isFavorite !== undefined ? { isFavorite } : {}),
      },
    });

    return NextResponse.json({
      success: true,
      content: updated,
      message: 'Content updated',
    });
  } catch (error) {
    console.error('Error updating content:', error);
    return NextResponse.json(
      { error: 'Failed to update content' },
      { status: 500 }
    );
  }
}


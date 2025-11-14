import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/feed/preferences
 * Get user's feed preferences
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');

    const where: any = { userId };
    if (category) {
      where.category = category;
    }

    const preferences = await prisma.userPreference.findMany({
      where,
      orderBy: [{ category: 'asc' }, { key: 'asc' }],
    });

    // Group by category
    const grouped = preferences.reduce((acc, pref) => {
      if (!acc[pref.category]) {
        acc[pref.category] = [];
      }
      acc[pref.category].push({
        key: pref.key,
        value: pref.value,
        createdAt: pref.createdAt,
        updatedAt: pref.updatedAt,
      });
      return acc;
    }, {} as Record<string, any[]>);

    return NextResponse.json({
      preferences: grouped,
      total: preferences.length,
    });
  } catch (error) {
    console.error('Error fetching preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/feed/preferences
 * Update user's feed preferences
 */
export async function PUT(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { category, key, value } = body;

    if (!category || !key || value === undefined) {
      return NextResponse.json(
        { error: 'Category, key, and value required' },
        { status: 400 }
      );
    }

    const preference = await prisma.userPreference.upsert({
      where: {
        userId_category_key: {
          userId,
          category,
          key,
        },
      },
      update: {
        value: value.toString(),
      },
      create: {
        userId,
        category,
        key,
        value: value.toString(),
      },
    });

    return NextResponse.json({
      success: true,
      preference,
      message: 'Preference updated',
    });
  } catch (error) {
    console.error('Error updating preference:', error);
    return NextResponse.json(
      { error: 'Failed to update preference' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/feed/preferences
 * Delete a user preference
 */
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const key = searchParams.get('key');

    if (!category || !key) {
      return NextResponse.json(
        { error: 'Category and key required' },
        { status: 400 }
      );
    }

    await prisma.userPreference.deleteMany({
      where: {
        userId,
        category,
        key,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Preference deleted',
    });
  } catch (error) {
    console.error('Error deleting preference:', error);
    return NextResponse.json(
      { error: 'Failed to delete preference' },
      { status: 500 }
    );
  }
}

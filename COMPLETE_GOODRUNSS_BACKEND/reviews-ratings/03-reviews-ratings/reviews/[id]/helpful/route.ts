import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/reviews/[id]/helpful - Mark review as helpful
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { userId, helpful } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Check if review exists
    const review = await prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    // For now, we'll just return success
    // In production, you'd want to:
    // 1. Create a ReviewHelpful table to track who marked what as helpful
    // 2. Prevent duplicate helpful marks
    // 3. Count total helpful marks

    return NextResponse.json({
      message: helpful ? 'Marked as helpful' : 'Unmarked as helpful',
    });
  } catch (error: any) {
    console.error('Error marking review as helpful:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to mark review as helpful' },
      { status: 500 }
    );
  }
}


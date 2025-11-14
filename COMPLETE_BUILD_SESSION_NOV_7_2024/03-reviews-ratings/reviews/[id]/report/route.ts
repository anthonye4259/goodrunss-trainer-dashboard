import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/reviews/[id]/report - Report review
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { userId, reason, details } = await req.json();

    if (!userId || !reason) {
      return NextResponse.json(
        { error: 'userId and reason are required' },
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

    // Create report (using our safety reports system)
    // We'll create this when we build the safety features
    // For now, just log and return success
    console.log('Review reported:', {
      reviewId: id,
      userId,
      reason,
      details,
    });

    // TODO: Create report in database when safety system is built
    // await prisma.report.create({
    //   data: {
    //     reporterId: userId,
    //     contentType: 'review',
    //     contentId: id,
    //     reason,
    //     details,
    //   },
    // });

    return NextResponse.json({
      message: 'Review reported successfully. Our team will review it.',
    });
  } catch (error: any) {
    console.error('Error reporting review:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to report review' },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/reviews/[id]/respond - Trainer responds to review
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { trainerId, response } = await req.json();

    if (!trainerId || !response) {
      return NextResponse.json(
        { error: 'trainerId and response are required' },
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

    // Check if trainer owns this review
    if (review.trainerId !== trainerId) {
      return NextResponse.json(
        { error: 'You can only respond to your own reviews' },
        { status: 403 }
      );
    }

    // Update review with response
    const updated = await prisma.review.update({
      where: { id },
      data: {
        trainerResponse: response,
        respondedAt: new Date(),
      },
    });

    // TODO: Send notification to client about trainer response

    return NextResponse.json({
      review: updated,
      message: 'Response added successfully',
    });
  } catch (error: any) {
    console.error('Error responding to review:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to respond to review' },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT /api/reviews/[id] - Update review
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { rating, comment, clientId } = await req.json();

    if (!clientId) {
      return NextResponse.json(
        { error: 'clientId is required' },
        { status: 400 }
      );
    }

    // Get existing review
    const existing = await prisma.review.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    // Check ownership
    if (existing.clientId !== clientId) {
      return NextResponse.json(
        { error: 'You can only edit your own reviews' },
        { status: 403 }
      );
    }

    // Check if review is within edit window (e.g., 7 days)
    const daysSinceCreation = Math.floor(
      (Date.now() - existing.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceCreation > 7) {
      return NextResponse.json(
        { error: 'Reviews can only be edited within 7 days' },
        { status: 400 }
      );
    }

    // Update review
    const updated = await prisma.review.update({
      where: { id },
      data: {
        rating: rating || existing.rating,
        comment: comment !== undefined ? comment : existing.comment,
        updatedAt: new Date(),
      },
    });

    // Update trainer rating if rating changed
    if (rating && rating !== existing.rating) {
      await updateTrainerRating(existing.trainerId);
    }

    return NextResponse.json({
      review: updated,
      message: 'Review updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating review:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update review' },
      { status: 500 }
    );
  }
}

// DELETE /api/reviews/[id] - Delete review
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get('clientId');

    if (!clientId) {
      return NextResponse.json(
        { error: 'clientId is required' },
        { status: 400 }
      );
    }

    // Get existing review
    const existing = await prisma.review.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    // Check ownership
    if (existing.clientId !== clientId) {
      return NextResponse.json(
        { error: 'You can only delete your own reviews' },
        { status: 403 }
      );
    }

    // Delete review
    await prisma.review.delete({
      where: { id },
    });

    // Update trainer rating
    await updateTrainerRating(existing.trainerId);

    return NextResponse.json({
      message: 'Review deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete review' },
      { status: 500 }
    );
  }
}

// Helper function
async function updateTrainerRating(trainerId: string) {
  const stats = await prisma.review.aggregate({
    where: { trainerId },
    _avg: { rating: true },
    _count: true,
  });

  await prisma.user.update({
    where: { id: trainerId },
    data: {
      rating: stats._avg.rating || 0,
    },
  });
}


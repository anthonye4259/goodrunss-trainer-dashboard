import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/reviews - Create review
export async function POST(req: NextRequest) {
  try {
    const {
      trainerId,
      clientId,
      sessionId,
      rating,
      comment,
      photos,
    } = await req.json();

    if (!trainerId || !clientId || !rating) {
      return NextResponse.json(
        { error: 'trainerId, clientId, and rating are required' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Check if session exists and is completed
    if (sessionId) {
      const session = await prisma.trainerSession.findUnique({
        where: { id: sessionId },
      });

      if (!session) {
        return NextResponse.json(
          { error: 'Session not found' },
          { status: 404 }
        );
      }

      if (session.status !== 'COMPLETED') {
        return NextResponse.json(
          { error: 'Can only review completed sessions' },
          { status: 400 }
        );
      }

      // Check if already reviewed
      const existing = await prisma.review.findFirst({
        where: {
          sessionId,
          clientId,
        },
      });

      if (existing) {
        return NextResponse.json(
          { error: 'You have already reviewed this session' },
          { status: 400 }
        );
      }
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        trainerId,
        clientId,
        sessionId,
        rating,
        comment,
      },
    });

    // Update trainer's average rating
    await updateTrainerRating(trainerId);

    return NextResponse.json({
      review,
      message: 'Review created successfully',
    });
  } catch (error: any) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create review' },
      { status: 500 }
    );
  }
}

// GET /api/reviews - Get reviews
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const trainerId = searchParams.get('trainerId');
    const clientId = searchParams.get('clientId');
    const rating = searchParams.get('rating');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const sortBy = searchParams.get('sortBy') || 'recent'; // recent, helpful, rating

    if (!trainerId && !clientId) {
      return NextResponse.json(
        { error: 'trainerId or clientId is required' },
        { status: 400 }
      );
    }

    const where: any = {};
    if (trainerId) where.trainerId = trainerId;
    if (clientId) where.clientId = clientId;
    if (rating) where.rating = parseInt(rating);

    // Determine sort order
    let orderBy: any = { createdAt: 'desc' }; // Default: recent
    if (sortBy === 'rating') {
      orderBy = { rating: 'desc' };
    }
    // Note: 'helpful' would need a helpfulCount field

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          trainer: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          client: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy,
        take: limit,
        skip: offset,
      }),
      prisma.review.count({ where }),
    ]);

    // Calculate rating distribution
    const ratingStats = await prisma.review.groupBy({
      by: ['rating'],
      where: trainerId ? { trainerId } : undefined,
      _count: true,
    });

    const distribution = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    ratingStats.forEach((stat) => {
      distribution[stat.rating as keyof typeof distribution] = stat._count;
    });

    return NextResponse.json({
      reviews,
      total,
      hasMore: offset + limit < total,
      distribution,
      metadata: {
        limit,
        offset,
        sortBy,
      },
    });
  } catch (error: any) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

// Update trainer's average rating
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


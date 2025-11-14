import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/payments/history - Get user's payment history
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const role = searchParams.get('role'); // 'client' or 'trainer'
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status'); // COMPLETED, PENDING, REFUNDED, FAILED

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const where: any = {};
    if (status) {
      where.status = status;
    }

    // Query based on role
    if (role === 'trainer') {
      where.trainerId = userId;
    } else {
      where.appClientId = userId;
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          session: {
            select: {
              id: true,
              title: true,
              scheduledAt: true,
              type: true,
              duration: true,
            },
          },
          trainer: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          appClient: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          refund: true,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.payment.count({ where }),
    ]);

    // Calculate totals
    const totals = await prisma.payment.aggregate({
      where,
      _sum: {
        amount: true,
        platformFee: true,
        stripeFee: true,
        trainerPayout: true,
      },
      _count: true,
    });

    return NextResponse.json({
      payments,
      total,
      hasMore: offset + limit < total,
      offset,
      limit,
      totals: {
        amount: totals._sum.amount || 0,
        platformFee: totals._sum.platformFee || 0,
        stripeFee: totals._sum.stripeFee || 0,
        trainerPayout: totals._sum.trainerPayout || 0,
        count: totals._count,
      },
    });
  } catch (error: any) {
    console.error('Error fetching payment history:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch payment history' },
      { status: 500 }
    );
  }
}


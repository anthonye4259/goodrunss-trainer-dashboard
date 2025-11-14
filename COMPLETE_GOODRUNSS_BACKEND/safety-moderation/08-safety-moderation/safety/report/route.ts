import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/safety/report - Report user or content
export async function POST(req: NextRequest) {
  try {
    const {
      reporterId,
      reporterEmail,
      contentType,
      contentId,
      reportedUserId,
      reason,
      category,
      description,
      evidence,
    } = await req.json();

    if (!reporterId || !contentType || !contentId || !reason) {
      return NextResponse.json(
        { error: 'reporterId, contentType, contentId, and reason are required' },
        { status: 400 }
      );
    }

    // Determine priority based on reason
    let priority = 'normal';
    if (
      category === 'harassment' ||
      category === 'hate_speech' ||
      category === 'violence' ||
      reason === 'harassment' ||
      reason === 'fraud'
    ) {
      priority = 'high';
    }

    // Create report
    const report = await prisma.report.create({
      data: {
        reporterId,
        reporterEmail,
        contentType,
        contentId,
        reportedUserId,
        reason,
        category,
        description,
        evidence: evidence || [],
        priority,
      },
    });

    // TODO: Send alert to moderation team if high priority

    return NextResponse.json({
      report,
      message: 'Report submitted successfully. Our team will review it.',
    });
  } catch (error: any) {
    console.error('Error creating report:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit report' },
      { status: 500 }
    );
  }
}

// GET /api/safety/report - Get reports (admin only)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'pending';
    const priority = searchParams.get('priority');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = {};
    if (status && status !== 'all') where.status = status;
    if (priority) where.priority = priority;

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' },
        ],
        take: limit,
        skip: offset,
      }),
      prisma.report.count({ where }),
    ]);

    return NextResponse.json({
      reports,
      total,
      hasMore: offset + limit < total,
    });
  } catch (error: any) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT /api/safety/report/[id]/resolve - Resolve report (admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const {
      reviewedBy,
      resolution,
      resolutionNotes,
      actionTaken,
    } = await req.json();

    if (!reviewedBy || !resolution) {
      return NextResponse.json(
        { error: 'reviewedBy and resolution are required' },
        { status: 400 }
      );
    }

    // Update report
    const report = await prisma.report.update({
      where: { id },
      data: {
        status: 'resolved',
        reviewedBy,
        reviewedAt: new Date(),
        resolution,
        resolutionNotes,
        actionTaken,
      },
    });

    // Log moderation action
    await prisma.moderationAction.create({
      data: {
        moderatorId: reviewedBy,
        moderatorName: 'Admin', // TODO: Get actual moderator name
        actionType: 'resolve_report',
        targetType: 'report',
        targetId: id,
        reason: resolution,
        notes: resolutionNotes,
        isAutomated: false,
      },
    });

    // TODO: Send notification to reporter about resolution

    return NextResponse.json({
      report,
      message: 'Report resolved successfully',
    });
  } catch (error: any) {
    console.error('Error resolving report:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to resolve report' },
      { status: 500 }
    );
  }
}


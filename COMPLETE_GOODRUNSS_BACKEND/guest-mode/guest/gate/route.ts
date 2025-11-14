import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/guest/gate - Log when anonymous user hits authentication gate
export async function POST(req: NextRequest) {
  try {
    const {
      sessionToken,
      userId,
      gateType,
      gateTrigger,
      gateLocation,
      contentType,
      contentId,
      metadata,
    } = await req.json();

    if (!sessionToken && !userId) {
      return NextResponse.json(
        { error: 'Either sessionToken or userId is required' },
        { status: 400 }
      );
    }

    if (!gateType || !gateTrigger || !gateLocation) {
      return NextResponse.json(
        { error: 'gateType, gateTrigger, and gateLocation are required' },
        { status: 400 }
      );
    }

    // Log the gate encounter
    const gate = await prisma.authenticationGate.create({
      data: {
        sessionToken,
        userId,
        gateType,
        gateTrigger,
        gateLocation,
        contentType,
        contentId,
        metadata,
      },
    });

    return NextResponse.json({
      gate,
      message: 'Gate logged',
    });
  } catch (error) {
    console.error('Error logging authentication gate:', error);
    return NextResponse.json(
      { error: 'Failed to log gate' },
      { status: 500 }
    );
  }
}

// PUT /api/guest/gate/:id - Update gate outcome (after authentication)
export async function PUT(req: NextRequest) {
  try {
    const {
      gateId,
      didAuthenticate,
      didConvert,
    } = await req.json();

    if (!gateId) {
      return NextResponse.json(
        { error: 'gateId is required' },
        { status: 400 }
      );
    }

    const updates: any = {};
    if (didAuthenticate !== undefined) {
      updates.didAuthenticate = didAuthenticate;
      updates.authenticatedAt = didAuthenticate ? new Date() : null;
    }
    if (didConvert !== undefined) {
      updates.didConvert = didConvert;
    }

    const gate = await prisma.authenticationGate.update({
      where: { id: gateId },
      data: updates,
    });

    return NextResponse.json({
      gate,
      message: 'Gate updated',
    });
  } catch (error) {
    console.error('Error updating gate:', error);
    return NextResponse.json(
      { error: 'Failed to update gate' },
      { status: 500 }
    );
  }
}

// GET /api/guest/gate/analytics - Get gate analytics
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get('days') || '30');

    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Total gates
    const totalGates = await prisma.authenticationGate.count({
      where: { createdAt: { gte: since } },
    });

    // Authenticated
    const authenticated = await prisma.authenticationGate.count({
      where: {
        createdAt: { gte: since },
        didAuthenticate: true,
      },
    });

    // Converted
    const converted = await prisma.authenticationGate.count({
      where: {
        createdAt: { gte: since },
        didConvert: true,
      },
    });

    // By gate type
    const byGateType = await prisma.authenticationGate.groupBy({
      by: ['gateType'],
      where: { createdAt: { gte: since } },
      _count: true,
      _sum: {
        didAuthenticate: true,
        didConvert: true,
      },
    });

    // Calculate rates
    const authRate = totalGates > 0 ? (authenticated / totalGates) * 100 : 0;
    const conversionRate = authenticated > 0 ? (converted / authenticated) * 100 : 0;

    return NextResponse.json({
      stats: {
        totalGates,
        authenticated,
        converted,
        authenticationRate: `${authRate.toFixed(2)}%`,
        conversionRate: `${conversionRate.toFixed(2)}%`,
        byGateType: byGateType.map((gate) => ({
          gateType: gate.gateType,
          total: gate._count,
          authenticated: gate._sum.didAuthenticate || 0,
          converted: gate._sum.didConvert || 0,
        })),
      },
      period: {
        days,
        from: since.toISOString(),
        to: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching gate analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}


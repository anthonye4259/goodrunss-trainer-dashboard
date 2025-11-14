import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/safety/verify - Submit trainer verification
export async function POST(req: NextRequest) {
  try {
    const {
      trainerId,
      trainerEmail,
      verificationType,
      documentType,
      documentUrl,
      documentNumber,
      expiresAt,
      notes,
    } = await req.json();

    if (!trainerId || !trainerEmail || !verificationType) {
      return NextResponse.json(
        { error: 'trainerId, trainerEmail, and verificationType are required' },
        { status: 400 }
      );
    }

    // Check if verification already exists
    const existing = await prisma.trainerVerification.findUnique({
      where: { trainerId },
    });

    if (existing && existing.status === 'pending') {
      return NextResponse.json(
        { error: 'Verification already pending' },
        { status: 400 }
      );
    }

    // Create or update verification
    const verification = existing
      ? await prisma.trainerVerification.update({
          where: { trainerId },
          data: {
            verificationType,
            status: 'pending',
            documentType,
            documentUrl,
            documentNumber,
            expiresAt: expiresAt ? new Date(expiresAt) : null,
            notes,
            submittedAt: new Date(),
          },
        })
      : await prisma.trainerVerification.create({
          data: {
            trainerId,
            trainerEmail,
            verificationType,
            documentType,
            documentUrl,
            documentNumber,
            expiresAt: expiresAt ? new Date(expiresAt) : null,
            notes,
          },
        });

    return NextResponse.json({
      verification,
      message: 'Verification submitted successfully',
    });
  } catch (error: any) {
    console.error('Error submitting verification:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit verification' },
      { status: 500 }
    );
  }
}

// GET /api/safety/verify - Get verification status
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const trainerId = searchParams.get('trainerId');
    const status = searchParams.get('status');

    if (!trainerId && !status) {
      return NextResponse.json(
        { error: 'trainerId or status is required' },
        { status: 400 }
      );
    }

    // Get single trainer verification
    if (trainerId) {
      const verification = await prisma.trainerVerification.findUnique({
        where: { trainerId },
      });

      return NextResponse.json({
        verification,
      });
    }

    // Get all verifications by status (admin)
    const where: any = {};
    if (status) where.status = status;

    const verifications = await prisma.trainerVerification.findMany({
      where,
      orderBy: { submittedAt: 'desc' },
    });

    return NextResponse.json({
      verifications,
      count: verifications.length,
    });
  } catch (error: any) {
    console.error('Error fetching verification:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch verification' },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/search/filters - Get available filter options
export async function GET(req: NextRequest) {
  try {
    // Get all unique filter options from database
    const [trainers] = await Promise.all([
      prisma.user.findMany({
        where: { role: 'TRAINER' },
        select: {
          specialties: true,
          hourlyRate: true,
          certifications: true,
          rating: true,
        },
      }),
    ]);

    // Aggregate specialties
    const specialtiesSet = new Set<string>();
    trainers.forEach((trainer) => {
      trainer.specialties?.forEach((s) => specialtiesSet.add(s));
    });
    const specialties = Array.from(specialtiesSet).sort();

    // Aggregate certifications
    const certificationsSet = new Set<string>();
    trainers.forEach((trainer) => {
      trainer.certifications?.forEach((c) => certificationsSet.add(c));
    });
    const certifications = Array.from(certificationsSet).sort();

    // Calculate price range
    const prices = trainers
      .map((t) => t.hourlyRate)
      .filter((p): p is number => p !== null);
    const priceRange = {
      min: prices.length > 0 ? Math.min(...prices) : 0,
      max: prices.length > 0 ? Math.max(...prices) : 200,
      average: prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 50,
    };

    // Calculate rating distribution
    const ratings = trainers
      .map((t) => t.rating)
      .filter((r): r is number => r !== null);
    const ratingDistribution = {
      5: ratings.filter((r) => r >= 4.5).length,
      4: ratings.filter((r) => r >= 4.0 && r < 4.5).length,
      3: ratings.filter((r) => r >= 3.0 && r < 4.0).length,
      2: ratings.filter((r) => r >= 2.0 && r < 3.0).length,
      1: ratings.filter((r) => r < 2.0).length,
    };

    return NextResponse.json({
      specialties: specialties.map((s) => ({
        value: s,
        label: s,
        count: trainers.filter((t) => t.specialties?.includes(s)).length,
      })),
      certifications: certifications.map((c) => ({
        value: c,
        label: c,
        count: trainers.filter((t) => t.certifications?.includes(c)).length,
      })),
      priceRange,
      ratingDistribution,
      totalTrainers: trainers.length,
    });
  } catch (error: any) {
    console.error('Error getting filters:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get filters' },
      { status: 500 }
    );
  }
}


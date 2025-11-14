import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/search/popular - Get popular searches
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    // Get popular specialties (based on trainer count)
    const trainers = await prisma.user.findMany({
      where: { role: 'TRAINER' },
      select: { specialties: true },
    });

    const specialtyCounts: { [key: string]: number } = {};
    trainers.forEach((trainer) => {
      trainer.specialties?.forEach((specialty) => {
        specialtyCounts[specialty] = (specialtyCounts[specialty] || 0) + 1;
      });
    });

    const popularSearches = Object.entries(specialtyCounts)
      .map(([specialty, count]) => ({
        query: specialty,
        type: 'specialty',
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    // Add some curated popular searches
    const curatedSearches = [
      { query: 'Personal Training', type: 'specialty' },
      { query: 'Yoga', type: 'specialty' },
      { query: 'HIIT', type: 'specialty' },
      { query: 'Strength Training', type: 'specialty' },
      { query: 'Weight Loss', type: 'goal' },
      { query: 'Muscle Building', type: 'goal' },
    ];

    // Combine and deduplicate
    const combined = [
      ...popularSearches,
      ...curatedSearches.filter(
        (c) => !popularSearches.some((p) => p.query === c.query)
      ),
    ].slice(0, limit);

    return NextResponse.json({
      searches: combined,
      count: combined.length,
    });
  } catch (error: any) {
    console.error('Error getting popular searches:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get popular searches' },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/search/suggestions - Autocomplete suggestions
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query') || '';
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query || query.length < 2) {
      return NextResponse.json({
        suggestions: [],
        count: 0,
      });
    }

    // Get suggestions from different sources
    const [trainerNames, specialties, cities] = await Promise.all([
      // Trainer names
      prisma.user.findMany({
        where: {
          role: 'TRAINER',
          name: {
            contains: query,
            mode: 'insensitive',
          },
        },
        select: {
          name: true,
          specialties: true,
        },
        take: 5,
      }),

      // Specialties
      prisma.user.findMany({
        where: {
          role: 'TRAINER',
          specialties: {
            hasSome: [query],
          },
        },
        select: {
          specialties: true,
        },
        take: 10,
      }),

      // Cities
      prisma.user.findMany({
        where: {
          role: 'TRAINER',
          city: {
            contains: query,
            mode: 'insensitive',
          },
        },
        select: {
          city: true,
          state: true,
        },
        distinct: ['city', 'state'],
        take: 5,
      }),
    ]);

    // Build suggestions
    const suggestions: any[] = [];

    // Add trainer names
    trainerNames.forEach((trainer) => {
      suggestions.push({
        type: 'trainer',
        value: trainer.name,
        label: trainer.name,
        subtitle: trainer.specialties?.[0] || 'Personal Trainer',
      });
    });

    // Add unique specialties
    const uniqueSpecialties = new Set<string>();
    specialties.forEach((trainer) => {
      trainer.specialties?.forEach((specialty) => {
        if (specialty.toLowerCase().includes(query.toLowerCase())) {
          uniqueSpecialties.add(specialty);
        }
      });
    });
    
    Array.from(uniqueSpecialties).slice(0, 5).forEach((specialty) => {
      suggestions.push({
        type: 'specialty',
        value: specialty,
        label: specialty,
        subtitle: 'Specialty',
      });
    });

    // Add cities
    cities.forEach((location) => {
      if (location.city) {
        suggestions.push({
          type: 'location',
          value: location.city,
          label: `${location.city}${location.state ? `, ${location.state}` : ''}`,
          subtitle: 'Location',
        });
      }
    });

    // Sort by relevance (exact matches first)
    suggestions.sort((a, b) => {
      const aExact = a.value.toLowerCase() === query.toLowerCase() ? 1 : 0;
      const bExact = b.value.toLowerCase() === query.toLowerCase() ? 1 : 0;
      return bExact - aExact;
    });

    return NextResponse.json({
      suggestions: suggestions.slice(0, limit),
      count: suggestions.length,
      query,
    });
  } catch (error: any) {
    console.error('Error getting suggestions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get suggestions' },
      { status: 500 }
    );
  }
}


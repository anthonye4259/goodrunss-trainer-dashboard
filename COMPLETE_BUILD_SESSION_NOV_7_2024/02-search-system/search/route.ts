import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/search - Universal search for trainers, facilities, workouts
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    // Search parameters
    const query = searchParams.get('query') || '';
    const type = searchParams.get('type'); // trainer, facility, workout, all
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // Location filters
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const radius = parseInt(searchParams.get('radius') || '25'); // miles
    
    // Price filters
    const priceMin = searchParams.get('priceMin');
    const priceMax = searchParams.get('priceMax');
    
    // Other filters
    const specialty = searchParams.get('specialty');
    const minRating = searchParams.get('minRating');
    const sortBy = searchParams.get('sortBy') || 'relevance'; // relevance, distance, price, rating
    const availability = searchParams.get('availability'); // available, online, in_person
    
    const results: any = {
      trainers: [],
      facilities: [],
      workouts: [],
      total: 0,
    };

    // Search trainers
    if (!type || type === 'trainer' || type === 'all') {
      const trainers = await searchTrainers({
        query,
        lat,
        lng,
        radius,
        priceMin,
        priceMax,
        specialty,
        minRating,
        availability,
        sortBy,
        limit: type === 'all' ? 10 : limit,
        offset: type === 'all' ? 0 : offset,
      });
      results.trainers = trainers;
    }

    // Search facilities (if model exists)
    if (!type || type === 'facility' || type === 'all') {
      // TODO: Add facility search when facility model is created
      results.facilities = [];
    }

    // Search workouts (if model exists)
    if (!type || type === 'workout' || type === 'all') {
      // TODO: Add workout search when workout model is created
      results.workouts = [];
    }

    results.total = results.trainers.length + results.facilities.length + results.workouts.length;

    // Add search metadata
    const metadata = {
      query,
      type: type || 'all',
      filters: {
        location: lat && lng ? { lat, lng, radius } : null,
        price: priceMin || priceMax ? { min: priceMin, max: priceMax } : null,
        specialty,
        minRating,
        availability,
      },
      sortBy,
      pagination: {
        limit,
        offset,
        hasMore: results.total === limit,
      },
    };

    return NextResponse.json({
      ...results,
      metadata,
    });
  } catch (error: any) {
    console.error('Error searching:', error);
    return NextResponse.json(
      { error: error.message || 'Search failed' },
      { status: 500 }
    );
  }
}

// Search trainers with filters
async function searchTrainers(params: any) {
  const {
    query,
    lat,
    lng,
    radius,
    priceMin,
    priceMax,
    specialty,
    minRating,
    availability,
    sortBy,
    limit,
    offset,
  } = params;

  const where: any = {
    role: 'TRAINER',
  };

  // Text search (name, bio, specialties)
  if (query) {
    where.OR = [
      { name: { contains: query, mode: 'insensitive' } },
      { bio: { contains: query, mode: 'insensitive' } },
      { specialties: { hasSome: [query] } },
    ];
  }

  // Specialty filter
  if (specialty) {
    where.specialties = { has: specialty };
  }

  // Rating filter
  if (minRating) {
    where.rating = { gte: parseFloat(minRating) };
  }

  // Price filter (using hourlyRate)
  if (priceMin || priceMax) {
    where.hourlyRate = {};
    if (priceMin) where.hourlyRate.gte = parseFloat(priceMin);
    if (priceMax) where.hourlyRate.lte = parseFloat(priceMax);
  }

  // Availability filter
  if (availability === 'available') {
    where.isAvailable = true;
  }

  // Base query
  let trainers = await prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      bio: true,
      specialties: true,
      certifications: true,
      hourlyRate: true,
      rating: true,
      totalSessions: true,
      isAvailable: true,
      latitude: true,
      longitude: true,
      city: true,
      state: true,
      _count: {
        select: {
          reviews: true,
        },
      },
    },
    take: limit + 50, // Get extra for distance filtering
    skip: offset,
  });

  // Calculate distance and filter by radius
  if (lat && lng) {
    trainers = trainers
      .map((trainer) => {
        if (!trainer.latitude || !trainer.longitude) {
          return { ...trainer, distance: null };
        }
        
        const distance = calculateDistance(
          parseFloat(lat),
          parseFloat(lng),
          trainer.latitude,
          trainer.longitude
        );
        
        return { ...trainer, distance };
      })
      .filter((trainer) => trainer.distance === null || trainer.distance <= radius)
      .slice(0, limit);
  }

  // Sort results
  if (sortBy === 'distance' && lat && lng) {
    trainers.sort((a: any, b: any) => {
      if (a.distance === null) return 1;
      if (b.distance === null) return -1;
      return a.distance - b.distance;
    });
  } else if (sortBy === 'price') {
    trainers.sort((a, b) => (a.hourlyRate || 999) - (b.hourlyRate || 999));
  } else if (sortBy === 'rating') {
    trainers.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }
  // Default: relevance (already sorted by text match from Prisma)

  return trainers;
}

// Calculate distance between two points (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10; // Round to 1 decimal
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}


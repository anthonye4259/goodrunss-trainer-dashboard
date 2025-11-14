import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/i18n/regions
 * Get list of supported regions/countries
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const isActive = searchParams.get('active') === 'true';

    const where = isActive ? { isSupported: true, isActive: true } : {};

    const regions = await prisma.supportedRegion.findMany({
      where,
      orderBy: { countryName: 'asc' },
    });

    return NextResponse.json({ regions });
  } catch (error) {
    console.error('Error fetching regions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch regions' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/i18n/regions/[countryCode]
 * Get specific region details
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { countryCode } = body;

    if (!countryCode) {
      return NextResponse.json(
        { error: 'Country code required' },
        { status: 400 }
      );
    }

    const region = await prisma.supportedRegion.findUnique({
      where: { countryCode },
    });

    if (!region) {
      return NextResponse.json(
        { error: 'Region not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ region });
  } catch (error) {
    console.error('Error fetching region:', error);
    return NextResponse.json(
      { error: 'Failed to fetch region' },
      { status: 500 }
    );
  }
}

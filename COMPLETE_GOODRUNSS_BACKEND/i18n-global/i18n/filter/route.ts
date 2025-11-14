import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/i18n/filter - Filter content by region
export async function POST(req: NextRequest) {
  try {
    const {
      userId,
      countryCode,
      content,
    } = await req.json();

    if (!content || !Array.isArray(content)) {
      return NextResponse.json(
        { error: 'content array is required' },
        { status: 400 }
      );
    }

    // Get user's country if not provided
    let userCountry = countryCode;
    if (!userCountry && userId) {
      const locale = await prisma.userLocale.findUnique({
        where: { userId },
      });
      userCountry = locale?.country || 'US';
    }

    // Filter content based on regional availability
    const filtered = [];
    for (const item of content) {
      const isAvailable = await checkRegionalAvailability(
        item.contentType,
        item.contentId || item.id,
        userCountry
      );
      
      if (isAvailable) {
        filtered.push(item);
      }
    }

    return NextResponse.json({
      original: content.length,
      filtered: filtered.length,
      removed: content.length - filtered.length,
      content: filtered,
    });
  } catch (error) {
    console.error('Error filtering content:', error);
    return NextResponse.json(
      { error: 'Failed to filter content' },
      { status: 500 }
    );
  }
}

// Helper: Check if content is available in region
async function checkRegionalAvailability(
  contentType: string,
  contentId: string,
  countryCode: string
): Promise<boolean> {
  const availability = await prisma.regionalAvailability.findUnique({
    where: {
      contentType_contentId: {
        contentType,
        contentId,
      },
    },
  });

  if (!availability) {
    // No restrictions, available everywhere
    return true;
  }

  // Check if blocked in this country
  if (availability.blockedIn.includes(countryCode)) {
    return false;
  }

  // Check if only available in specific countries
  if (availability.availableIn.length > 0) {
    return availability.availableIn.includes(countryCode);
  }

  // Available by default
  return true;
}

// POST /api/i18n/filter/set - Set regional availability for content
export async function PUT(req: NextRequest) {
  try {
    const {
      contentType,
      contentId,
      availableIn,
      blockedIn,
      requiresGDPR,
      requiresCCPA,
      requiresLGPD,
      ageRestriction,
      blockReason,
    } = await req.json();

    if (!contentType || !contentId) {
      return NextResponse.json(
        { error: 'contentType and contentId are required' },
        { status: 400 }
      );
    }

    const availability = await prisma.regionalAvailability.upsert({
      where: {
        contentType_contentId: {
          contentType,
          contentId,
        },
      },
      update: {
        availableIn: availableIn || [],
        blockedIn: blockedIn || [],
        requiresGDPR,
        requiresCCPA,
        requiresLGPD,
        ageRestriction,
        blockReason,
      },
      create: {
        contentType,
        contentId,
        availableIn: availableIn || [],
        blockedIn: blockedIn || [],
        requiresGDPR: requiresGDPR || false,
        requiresCCPA: requiresCCPA || false,
        requiresLGPD: requiresLGPD || false,
        ageRestriction,
        blockReason,
      },
    });

    return NextResponse.json({
      availability,
      message: 'Regional availability updated',
    });
  } catch (error) {
    console.error('Error setting regional availability:', error);
    return NextResponse.json(
      { error: 'Failed to set regional availability' },
      { status: 500 }
    );
  }
}


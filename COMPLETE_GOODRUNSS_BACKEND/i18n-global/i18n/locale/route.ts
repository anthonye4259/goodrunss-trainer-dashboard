import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/i18n/locale
 * Get user's locale preferences
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let userLocale = await prisma.userLocale.findUnique({
      where: { userId },
    });

    // If no locale set, detect from request headers
    if (!userLocale) {
      const acceptLanguage = req.headers.get('accept-language') || 'en-US';
      const preferredLocale = acceptLanguage.split(',')[0].trim();
      const [language, country] = preferredLocale.split('-');

      userLocale = await prisma.userLocale.create({
        data: {
          userId,
          language: language || 'en',
          country: country || 'US',
          locale: preferredLocale,
          currency: 'USD', // Default, can be updated
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York',
          detectedLanguage: language,
          detectedCountry: country,
        },
      });
    }

    return NextResponse.json({ locale: userLocale });
  } catch (error) {
    console.error('Error fetching locale:', error);
    return NextResponse.json(
      { error: 'Failed to fetch locale' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/i18n/locale
 * Update user's locale preferences
 */
export async function PUT(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      language,
      country,
      currency,
      timezone,
      distanceUnit,
      weightUnit,
      temperatureUnit,
      dateFormat,
      timeFormat,
      firstDayOfWeek,
    } = body;

    const locale = `${language}-${country}`;

    const userLocale = await prisma.userLocale.upsert({
      where: { userId },
      update: {
        language,
        country,
        locale,
        currency,
        timezone,
        distanceUnit,
        weightUnit,
        temperatureUnit,
        dateFormat,
        timeFormat,
        firstDayOfWeek,
      },
      create: {
        userId,
        language,
        country,
        locale,
        currency,
        timezone,
        distanceUnit,
        weightUnit,
        temperatureUnit,
        dateFormat,
        timeFormat,
        firstDayOfWeek,
      },
    });

    return NextResponse.json({
      success: true,
      locale: userLocale,
      message: 'Locale preferences updated',
    });
  } catch (error) {
    console.error('Error updating locale:', error);
    return NextResponse.json(
      { error: 'Failed to update locale' },
      { status: 500 }
    );
  }
}

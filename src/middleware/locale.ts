import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

/**
 * Locale detection middleware
 * Automatically detects and sets user's locale preferences
 */
export async function localeMiddleware(req: NextRequest) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.next();
  }

  // Get locale from headers
  const acceptLanguage = req.headers.get('accept-language') || 'en-US';
  const preferredLocale = acceptLanguage.split(',')[0].trim();
  const [language, country] = preferredLocale.split('-');

  // Get timezone from client (if provided)
  const clientTimezone = req.headers.get('x-timezone') || 
    Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Get currency from country (approximate)
  const currencyMap: Record<string, string> = {
    'US': 'USD',
    'GB': 'GBP',
    'EU': 'EUR',
    'MX': 'MXN',
    'BR': 'BRL',
    'CA': 'CAD',
    'AU': 'AUD',
    'JP': 'JPY',
    'CN': 'CNY',
    'IN': 'INR',
  };
  
  const detectedCurrency = currencyMap[country || 'US'] || 'USD';

  // Add locale info to request headers for downstream use
  const response = NextResponse.next();
  response.headers.set('x-detected-language', language || 'en');
  response.headers.set('x-detected-country', country || 'US');
  response.headers.set('x-detected-locale', preferredLocale);
  response.headers.set('x-detected-currency', detectedCurrency);
  response.headers.set('x-detected-timezone', clientTimezone);

  return response;
}

/**
 * Get locale from request headers
 */
export function getLocaleFromRequest(req: NextRequest) {
  return {
    language: req.headers.get('x-detected-language') || 'en',
    country: req.headers.get('x-detected-country') || 'US',
    locale: req.headers.get('x-detected-locale') || 'en-US',
    currency: req.headers.get('x-detected-currency') || 'USD',
    timezone: req.headers.get('x-detected-timezone') || 'America/New_York',
  };
}


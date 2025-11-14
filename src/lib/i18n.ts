import { prisma } from './prisma';

/**
 * Internationalization utility functions
 */

export interface LocaleConfig {
  language: string;
  country: string;
  locale: string;
  currency: string;
  timezone: string;
  distanceUnit: string;
  weightUnit: string;
  temperatureUnit: string;
  dateFormat: string;
  timeFormat: string;
  firstDayOfWeek: number;
}

/**
 * Format currency based on user's locale
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format date based on user's locale
 */
export function formatDate(
  date: Date | string,
  locale: string = 'en-US',
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  }).format(dateObj);
}

/**
 * Format time based on user's locale
 */
export function formatTime(
  date: Date | string,
  locale: string = 'en-US',
  timeFormat: '12h' | '24h' = '12h'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: timeFormat === '12h',
  }).format(dateObj);
}

/**
 * Convert distance based on user's unit preference
 */
export function convertDistance(
  distance: number,
  fromUnit: 'miles' | 'kilometers',
  toUnit: 'miles' | 'kilometers'
): number {
  if (fromUnit === toUnit) return distance;
  
  if (fromUnit === 'miles' && toUnit === 'kilometers') {
    return distance * 1.60934;
  }
  
  return distance / 1.60934;
}

/**
 * Convert weight based on user's unit preference
 */
export function convertWeight(
  weight: number,
  fromUnit: 'lbs' | 'kg',
  toUnit: 'lbs' | 'kg'
): number {
  if (fromUnit === toUnit) return weight;
  
  if (fromUnit === 'lbs' && toUnit === 'kg') {
    return weight * 0.453592;
  }
  
  return weight / 0.453592;
}

/**
 * Convert temperature based on user's unit preference
 */
export function convertTemperature(
  temp: number,
  fromUnit: 'fahrenheit' | 'celsius',
  toUnit: 'fahrenheit' | 'celsius'
): number {
  if (fromUnit === toUnit) return temp;
  
  if (fromUnit === 'fahrenheit' && toUnit === 'celsius') {
    return (temp - 32) * (5 / 9);
  }
  
  return (temp * 9 / 5) + 32;
}

/**
 * Format number based on locale
 */
export function formatNumber(
  num: number,
  locale: string = 'en-US',
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(locale, options).format(num);
}

/**
 * Get user's locale configuration
 */
export async function getUserLocale(userId: string): Promise<LocaleConfig | null> {
  const userLocale = await prisma.userLocale.findUnique({
    where: { userId },
  });

  if (!userLocale) return null;

  return {
    language: userLocale.language,
    country: userLocale.country,
    locale: userLocale.locale,
    currency: userLocale.currency,
    timezone: userLocale.timezone,
    distanceUnit: userLocale.distanceUnit,
    weightUnit: userLocale.weightUnit,
    temperatureUnit: userLocale.temperatureUnit,
    dateFormat: userLocale.dateFormat,
    timeFormat: userLocale.timeFormat,
    firstDayOfWeek: userLocale.firstDayOfWeek,
  };
}

/**
 * Detect user's locale from request headers
 */
export function detectLocaleFromHeaders(headers: Headers): {
  language: string;
  country: string;
  locale: string;
} {
  const acceptLanguage = headers.get('accept-language') || 'en-US';
  const preferredLocale = acceptLanguage.split(',')[0].trim();
  const [language, country] = preferredLocale.split('-');

  return {
    language: language || 'en',
    country: country || 'US',
    locale: preferredLocale,
  };
}

/**
 * Translate content (placeholder for actual translation service)
 */
export async function translateContent(
  text: string,
  targetLanguage: string,
  sourceLanguage: string = 'en'
): Promise<string> {
  // TODO: Integrate with translation API (Google Translate, DeepL, etc.)
  // For now, return original text
  return text;
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currency: string, locale: string = 'en-US'): string {
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  
  const parts = formatter.formatToParts(0);
  const symbol = parts.find(part => part.type === 'currency')?.value;
  
  return symbol || currency;
}

/**
 * Check if region is supported
 */
export async function isRegionSupported(countryCode: string): Promise<boolean> {
  const region = await prisma.supportedRegion.findUnique({
    where: { countryCode },
  });

  return region ? region.isSupported && region.isActive : false;
}

/**
 * Get timezone offset in hours
 */
export function getTimezoneOffset(timezone: string): number {
  const now = new Date();
  const utc = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
  const target = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
  
  return (target.getTime() - utc.getTime()) / (1000 * 60 * 60);
}


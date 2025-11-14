/**
 * Caching Utilities for API Routes
 * Implements Vercel Edge Caching with proper cache control headers
 */

import { NextResponse } from 'next/server';

// Cache durations in seconds
export const CACHE_DURATIONS = {
  NONE: 0,
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  DAY: 86400, // 24 hours
  WEEK: 604800, // 7 days
  MONTH: 2592000, // 30 days
};

// Cache strategies
export type CacheStrategy = 'public' | 'private' | 'no-cache' | 'no-store';

interface CacheConfig {
  strategy: CacheStrategy;
  maxAge: number;
  sMaxAge?: number; // Shared cache (CDN) max age
  staleWhileRevalidate?: number;
  staleIfError?: number;
}

/**
 * Get cache control header string
 */
export function getCacheControlHeader(config: CacheConfig): string {
  const parts: string[] = [];

  // Strategy
  parts.push(config.strategy);

  // Max age
  if (config.maxAge > 0) {
    parts.push(`max-age=${config.maxAge}`);
  }

  // Shared cache max age (CDN)
  if (config.sMaxAge !== undefined) {
    parts.push(`s-maxage=${config.sMaxAge}`);
  }

  // Stale while revalidate
  if (config.staleWhileRevalidate !== undefined) {
    parts.push(`stale-while-revalidate=${config.staleWhileRevalidate}`);
  }

  // Stale if error
  if (config.staleIfError !== undefined) {
    parts.push(`stale-if-error=${config.staleIfError}`);
  }

  return parts.join(', ');
}

/**
 * Add cache headers to NextResponse
 */
export function withCache(
  response: NextResponse,
  duration: number,
  strategy: CacheStrategy = 'public'
): NextResponse {
  const config: CacheConfig = {
    strategy,
    maxAge: duration,
    sMaxAge: duration,
    staleWhileRevalidate: duration * 2, // Serve stale content while fetching fresh
    staleIfError: duration * 10, // Serve stale content if error
  };

  response.headers.set('Cache-Control', getCacheControlHeader(config));
  
  // Add ETag for conditional requests
  // response.headers.set('ETag', generateETag(response));

  return response;
}

/**
 * Create a cached JSON response
 */
export function cachedJson(
  data: any,
  duration: number = CACHE_DURATIONS.SHORT,
  strategy: CacheStrategy = 'public'
): NextResponse {
  const response = NextResponse.json(data);
  return withCache(response, duration, strategy);
}

/**
 * Create a no-cache response (always fresh)
 */
export function noCacheJson(data: any): NextResponse {
  const response = NextResponse.json(data);
  response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  return response;
}

/**
 * Predefined cache configurations for common use cases
 */
export const CachePresets = {
  // Static data that rarely changes
  STATIC: {
    strategy: 'public' as CacheStrategy,
    duration: CACHE_DURATIONS.DAY,
  },

  // Facilities, leagues, etc (updates daily)
  FACILITIES: {
    strategy: 'public' as CacheStrategy,
    duration: CACHE_DURATIONS.LONG, // 1 hour
  },

  // Search results (updates frequently)
  SEARCH: {
    strategy: 'public' as CacheStrategy,
    duration: CACHE_DURATIONS.MEDIUM, // 5 minutes
  },

  // User-specific data (don't cache in CDN)
  USER_DATA: {
    strategy: 'private' as CacheStrategy,
    duration: CACHE_DURATIONS.SHORT, // 1 minute
  },

  // Real-time data (minimal caching)
  REALTIME: {
    strategy: 'private' as CacheStrategy,
    duration: CACHE_DURATIONS.NONE,
  },

  // Authentication/sensitive data (never cache)
  AUTH: {
    strategy: 'no-store' as CacheStrategy,
    duration: CACHE_DURATIONS.NONE,
  },
};

/**
 * Apply preset cache configuration
 */
export function withCachePreset(
  response: NextResponse,
  preset: keyof typeof CachePresets
): NextResponse {
  const config = CachePresets[preset];
  return withCache(response, config.duration, config.strategy);
}

/**
 * Helper to create cached responses with presets
 */
export function cachedJsonWithPreset(
  data: any,
  preset: keyof typeof CachePresets
): NextResponse {
  const config = CachePresets[preset];
  return cachedJson(data, config.duration, config.strategy);
}

/**
 * Revalidation tag utilities for on-demand revalidation
 */
export function withRevalidateTags(
  response: NextResponse,
  tags: string[]
): NextResponse {
  response.headers.set('x-vercel-cache-tags', tags.join(','));
  return response;
}

/**
 * Example usage in API routes:
 * 
 * // Static data (1 day cache)
 * return cachedJsonWithPreset({ data }, 'STATIC');
 * 
 * // Facilities (1 hour cache)
 * return cachedJsonWithPreset({ facilities }, 'FACILITIES');
 * 
 * // Search results (5 min cache)
 * return cachedJsonWithPreset({ results }, 'SEARCH');
 * 
 * // User data (private, 1 min cache)
 * return cachedJsonWithPreset({ user }, 'USER_DATA');
 * 
 * // Real-time data (no cache)
 * return cachedJsonWithPreset({ liveData }, 'REALTIME');
 * 
 * // Auth endpoints (never cache)
 * return cachedJsonWithPreset({ token }, 'AUTH');
 * 
 * // Custom caching
 * return cachedJson({ data }, CACHE_DURATIONS.MEDIUM, 'public');
 */


/**
 * Rate Limiting Middleware for API Routes
 * Prevents abuse and protects against DDoS attacks
 * Uses in-memory storage for simplicity (upgrade to Redis for production scale)
 */

import { NextRequest, NextResponse } from 'next/server';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store (replace with Redis/Upstash for multi-instance deployments)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Rate limit configuration
const RATE_LIMITS = {
  // API endpoints
  '/api/': { maxRequests: 100, windowMs: 60000 }, // 100 requests per minute
  '/api/scraper/': { maxRequests: 10, windowMs: 60000 }, // 10 scraper requests per minute
  '/api/auth/': { maxRequests: 20, windowMs: 60000 }, // 20 auth requests per minute
  '/api/payments/': { maxRequests: 30, windowMs: 60000 }, // 30 payment requests per minute
};

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Get rate limit config for a given path
 */
function getRateLimitConfig(pathname: string): { maxRequests: number; windowMs: number } {
  // Find most specific matching path
  const matchingPath = Object.keys(RATE_LIMITS)
    .filter(path => pathname.startsWith(path))
    .sort((a, b) => b.length - a.length)[0];
  
  return matchingPath ? RATE_LIMITS[matchingPath as keyof typeof RATE_LIMITS] : RATE_LIMITS['/api/'];
}

/**
 * Get identifier for rate limiting (IP address or user ID)
 */
function getIdentifier(request: NextRequest): string {
  // Try to get user ID from auth header
  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    const userId = extractUserIdFromAuth(authHeader);
    if (userId) return `user:${userId}`;
  }

  // Fall back to IP address
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
              request.headers.get('x-real-ip') || 
              'unknown';
  return `ip:${ip}`;
}

/**
 * Extract user ID from authorization header
 */
function extractUserIdFromAuth(authHeader: string): string | null {
  try {
    // For Clerk: Bearer token contains user info
    // This is a simplified version - adjust based on your auth implementation
    if (authHeader.startsWith('Bearer ')) {
      // In production, decode JWT properly
      return authHeader.substring(7, 20); // Simple hash of token
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Rate limiting middleware
 */
export async function rateLimit(request: NextRequest): Promise<NextResponse | null> {
  const pathname = request.nextUrl.pathname;

  // Skip rate limiting for non-API routes
  if (!pathname.startsWith('/api/')) {
    return null;
  }

  // Skip rate limiting for health checks
  if (pathname === '/api/health') {
    return null;
  }

  const identifier = getIdentifier(request);
  const config = getRateLimitConfig(pathname);
  const key = `${pathname}:${identifier}`;
  const now = Date.now();

  // Get or create rate limit entry
  let entry = rateLimitStore.get(key);
  
  if (!entry || entry.resetTime < now) {
    // Create new entry
    entry = {
      count: 1,
      resetTime: now + config.windowMs,
    };
    rateLimitStore.set(key, entry);
  } else {
    // Increment existing entry
    entry.count++;
  }

  // Check if rate limit exceeded
  if (entry.count > config.maxRequests) {
    const resetInSeconds = Math.ceil((entry.resetTime - now) / 1000);
    
    return NextResponse.json(
      {
        error: 'Rate limit exceeded',
        message: `Too many requests. Please try again in ${resetInSeconds} seconds.`,
        retryAfter: resetInSeconds,
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': config.maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': entry.resetTime.toString(),
          'Retry-After': resetInSeconds.toString(),
        },
      }
    );
  }

  // Add rate limit headers to response
  const remaining = config.maxRequests - entry.count;
  
  // Return null to continue processing, but we'll add headers in the actual response
  return null;
}

/**
 * Get rate limit headers for successful responses
 */
export function getRateLimitHeaders(request: NextRequest): Record<string, string> {
  const pathname = request.nextUrl.pathname;
  const identifier = getIdentifier(request);
  const config = getRateLimitConfig(pathname);
  const key = `${pathname}:${identifier}`;
  
  const entry = rateLimitStore.get(key);
  
  if (!entry) {
    return {
      'X-RateLimit-Limit': config.maxRequests.toString(),
      'X-RateLimit-Remaining': config.maxRequests.toString(),
      'X-RateLimit-Reset': (Date.now() + config.windowMs).toString(),
    };
  }

  const remaining = Math.max(0, config.maxRequests - entry.count);
  
  return {
    'X-RateLimit-Limit': config.maxRequests.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': entry.resetTime.toString(),
  };
}

/**
 * Helper to apply rate limiting to API routes
 */
export async function withRateLimit(
  request: NextRequest,
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  // Check rate limit
  const rateLimitResponse = await rateLimit(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  // Execute handler
  const response = await handler();

  // Add rate limit headers
  const headers = getRateLimitHeaders(request);
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}


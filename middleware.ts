/**
 * Next.js Middleware
 * Runs on all requests before they reach API routes
 * Used for: rate limiting, authentication, logging, etc.
 */

import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, getRateLimitHeaders } from './src/middleware/rate-limit';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Apply rate limiting to API routes
  if (pathname.startsWith('/api/')) {
    const rateLimitResponse = await rateLimit(request);
    
    if (rateLimitResponse) {
      // Rate limit exceeded
      return rateLimitResponse;
    }

    // Continue to API route
    const response = NextResponse.next();
    
    // Add rate limit headers
    const headers = getRateLimitHeaders(request);
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    // Add security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};

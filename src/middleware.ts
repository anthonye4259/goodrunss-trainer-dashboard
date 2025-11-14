import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const origin = request.headers.get('origin')
  
  // Allowed origins for CORS
  const allowedOrigins = [
    'http://localhost:8081',           // Expo development
    'http://localhost:19000',          // Expo development (alt port)
    'http://localhost:19006',          // Expo web
    'exp://192.168.1.1:8081',          // Expo Go (update with your IP)
    'https://consumer.goodrunss.com',  // Production consumer app
    'goodrunss://',                    // React Native deep link
  ]

  // Check if origin is allowed
  const isAllowedOrigin = allowedOrigins.some(allowed => {
    if (origin?.startsWith(allowed)) return true
    if (allowed === 'goodrunss://' && origin?.startsWith('goodrunss://')) return true
    return false
  })

  // Clone the request headers
  const requestHeaders = new Headers(request.headers)
  
  // Create response
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  // Add CORS headers if origin is allowed
  if (isAllowedOrigin && origin) {
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key, x-user-id')
  }

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    if (isAllowedOrigin && origin) {
      return new NextResponse(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key, x-user-id',
          'Access-Control-Max-Age': '86400',
        },
      })
    }
  }

  return response
}

// Apply middleware to API routes that consumer app needs
export const config = {
  matcher: [
    '/api/v1/:path*',           // V1 Public API
    '/api/public/:path*',        // Public endpoints
    '/api/ai-persona/:path*',    // AI Persona endpoints
    '/api/gia/:path*',           // GIA endpoints
  ],
}


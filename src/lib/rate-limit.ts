import { NextRequest, NextResponse } from "next/server"

interface RateLimitConfig {
  interval: number // Time window in milliseconds
  uniqueTokenPerInterval: number // Max requests per interval
}

// In-memory store for rate limiting (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export class RateLimiter {
  private config: RateLimitConfig

  constructor(config: RateLimitConfig) {
    this.config = config
  }

  async check(identifier: string): Promise<{
    success: boolean
    limit: number
    remaining: number
    reset: number
  }> {
    const now = Date.now()
    const record = rateLimitStore.get(identifier)

    // Clean up old records periodically
    this.cleanup()

    if (!record || now > record.resetTime) {
      // New interval, reset the count
      rateLimitStore.set(identifier, {
        count: 1,
        resetTime: now + this.config.interval,
      })

      return {
        success: true,
        limit: this.config.uniqueTokenPerInterval,
        remaining: this.config.uniqueTokenPerInterval - 1,
        reset: now + this.config.interval,
      }
    }

    if (record.count >= this.config.uniqueTokenPerInterval) {
      // Rate limit exceeded
      return {
        success: false,
        limit: this.config.uniqueTokenPerInterval,
        remaining: 0,
        reset: record.resetTime,
      }
    }

    // Increment count
    record.count++
    rateLimitStore.set(identifier, record)

    return {
      success: true,
      limit: this.config.uniqueTokenPerInterval,
      remaining: this.config.uniqueTokenPerInterval - record.count,
      reset: record.resetTime,
    }
  }

  private cleanup() {
    const now = Date.now()
    const entries = Array.from(rateLimitStore.entries())
    
    for (const [key, record] of entries) {
      if (now > record.resetTime) {
        rateLimitStore.delete(key)
      }
    }
  }
}

// Predefined rate limiters
export const apiRateLimiter = new RateLimiter({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 60, // 60 requests per minute
})

export const strictRateLimiter = new RateLimiter({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 10, // 10 requests per minute (for sensitive endpoints)
})

export const generousRateLimiter = new RateLimiter({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 120, // 120 requests per minute
})

// Middleware helper
export async function rateLimit(
  req: NextRequest,
  limiter: RateLimiter = apiRateLimiter
): Promise<NextResponse | null> {
  // Get identifier (IP address or user ID)
  const forwarded = req.headers.get("x-forwarded-for")
  const ip = forwarded ? forwarded.split(",")[0] : "127.0.0.1"
  const identifier = ip

  const result = await limiter.check(identifier)

  if (!result.success) {
    return NextResponse.json(
      {
        error: "Too many requests",
        message: "Rate limit exceeded. Please try again later.",
        retryAfter: Math.ceil((result.reset - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": result.limit.toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": result.reset.toString(),
          "Retry-After": Math.ceil((result.reset - Date.now()) / 1000).toString(),
        },
      }
    )
  }

  // Add rate limit headers to successful responses
  return null // No error, continue processing
}

// Helper to add rate limit headers to responses
export function addRateLimitHeaders(
  response: NextResponse,
  result: { limit: number; remaining: number; reset: number }
): NextResponse {
  response.headers.set("X-RateLimit-Limit", result.limit.toString())
  response.headers.set("X-RateLimit-Remaining", result.remaining.toString())
  response.headers.set("X-RateLimit-Reset", result.reset.toString())
  return response
}


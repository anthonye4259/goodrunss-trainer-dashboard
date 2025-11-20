/**
 * Redis Client for Caching & Rate Limiting
 * 
 * Uses Upstash Redis (serverless-friendly)
 * To enable: Add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to .env
 */

// Check if Redis is configured
const REDIS_ENABLED = !!(
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN
)

// Lazy load Redis client only if configured
let redis: any = null

if (REDIS_ENABLED) {
  try {
    const { Redis } = require("@upstash/redis")
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  } catch (error) {
    console.warn("Redis not available. Install: npm install @upstash/redis")
  }
}

/**
 * Get cached value by key
 */
export async function getCached<T>(key: string): Promise<T | null> {
  if (!redis) return null

  try {
    const cached = await redis.get(key)
    return cached as T | null
  } catch (error) {
    console.error("Redis get error:", error)
    return null
  }
}

/**
 * Set cache with TTL
 */
export async function setCache(
  key: string,
  value: any,
  ttlSeconds: number = 3600
): Promise<void> {
  if (!redis) return

  try {
    await redis.set(key, value, { ex: ttlSeconds })
  } catch (error) {
    console.error("Redis set error:", error)
  }
}

/**
 * Delete cached value
 */
export async function deleteCache(key: string): Promise<void> {
  if (!redis) return

  try {
    await redis.del(key)
  } catch (error) {
    console.error("Redis delete error:", error)
  }
}

/**
 * Rate limiting with sliding window
 * 
 * @param identifier - Unique identifier (e.g., IP address, user ID)
 * @param limit - Maximum requests allowed
 * @param windowSeconds - Time window in seconds
 * @returns Object with success flag and remaining requests
 */
export async function checkRateLimit(
  identifier: string,
  limit: number = 10,
  windowSeconds: number = 60
): Promise<{ success: boolean; remaining: number; resetAt: number }> {
  if (!redis) {
    // If Redis not configured, allow all requests
    return { success: true, remaining: limit, resetAt: Date.now() + windowSeconds * 1000 }
  }

  try {
    const key = `ratelimit:${identifier}`
    const now = Date.now()
    const windowStart = now - windowSeconds * 1000

    // Remove old entries
    await redis.zremrangebyscore(key, 0, windowStart)

    // Count requests in current window
    const count = await redis.zcard(key)

    if (count >= limit) {
      // Get oldest entry to calculate reset time
      const oldest = await redis.zrange(key, 0, 0, { withScores: true })
      const resetAt = oldest[1] ? Number(oldest[1]) + windowSeconds * 1000 : now + windowSeconds * 1000

      return {
        success: false,
        remaining: 0,
        resetAt,
      }
    }

    // Add current request
    await redis.zadd(key, { score: now, member: `${now}:${Math.random()}` })
    await redis.expire(key, windowSeconds)

    return {
      success: true,
      remaining: limit - count - 1,
      resetAt: now + windowSeconds * 1000,
    }
  } catch (error) {
    console.error("Redis rate limit error:", error)
    // On error, allow the request
    return { success: true, remaining: limit, resetAt: Date.now() + windowSeconds * 1000 }
  }
}

/**
 * Check if Redis is available
 */
export function isRedisEnabled(): boolean {
  return REDIS_ENABLED && redis !== null
}

/**
 * Cache key generators
 */
export const CacheKeys = {
  trainerStats: (trainerId: string) => `trainer:${trainerId}:stats`,
  trainerServices: (trainerId: string) => `trainer:${trainerId}:services`,
  trainerAvailability: (trainerId: string) => `trainer:${trainerId}:availability`,
  trainerProfile: (trainerId: string) => `trainer:${trainerId}:profile`,
  publicTrainer: (trainerId: string) => `public:trainer:${trainerId}`,
}

/**
 * Cache TTLs (in seconds)
 */
export const CacheTTL = {
  SHORT: 60,        // 1 minute
  MEDIUM: 300,      // 5 minutes
  LONG: 3600,       // 1 hour
  DAY: 86400,       // 24 hours
}

export default redis


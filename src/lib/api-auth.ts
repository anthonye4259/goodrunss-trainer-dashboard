/**
 * GoodRunss Public API - Authentication & Rate Limiting
 * 
 * Validates API keys and enforces rate limits
 */

import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';
import crypto from 'crypto';

export interface ApiKeyData {
  id: string;
  name: string;
  ownerId: string;
  ownerType: string;
  scopes: string[];
  environment: string;
  rateLimitPerMinute: number;
  rateLimitPerHour: number;
  rateLimitPerDay: number;
}

/**
 * Validate API key from request headers
 */
export async function validateApiKey(request: NextRequest): Promise<{
  valid: boolean;
  apiKey?: ApiKeyData;
  error?: string;
}> {
  // Get API key from header
  const authHeader = request.headers.get('authorization');
  const apiKey = authHeader?.replace('Bearer ', '');

  if (!apiKey) {
    return { valid: false, error: 'Missing API key' };
  }

  // Validate key format (grsk_live_* or grsk_test_*)
  if (!apiKey.startsWith('grsk_')) {
    return { valid: false, error: 'Invalid API key format' };
  }

  try {
    // Find API key in database
    const key = await prisma.$queryRaw<any[]>`
      SELECT 
        id,
        name,
        owner_id as "ownerId",
        owner_type as "ownerType",
        scopes,
        environment,
        rate_limit_per_minute as "rateLimitPerMinute",
        rate_limit_per_hour as "rateLimitPerHour",
        rate_limit_per_day as "rateLimitPerDay",
        is_active as "isActive",
        expires_at as "expiresAt"
      FROM api_keys
      WHERE key = ${apiKey}
      LIMIT 1
    `;

    if (key.length === 0) {
      return { valid: false, error: 'Invalid API key' };
    }

    const apiKeyData = key[0];

    // Check if key is active
    if (!apiKeyData.isActive) {
      return { valid: false, error: 'API key is inactive' };
    }

    // Check if key is expired
    if (apiKeyData.expiresAt && new Date(apiKeyData.expiresAt) < new Date()) {
      return { valid: false, error: 'API key has expired' };
    }

    // Update last_used_at
    await prisma.$executeRaw`
      UPDATE api_keys
      SET last_used_at = NOW()
      WHERE id = ${apiKeyData.id}
    `;

    return {
      valid: true,
      apiKey: apiKeyData,
    };
  } catch (error) {
    console.error('API key validation error:', error);
    return { valid: false, error: 'Internal server error' };
  }
}

/**
 * Check rate limits for API key
 */
export async function checkRateLimit(
  apiKeyId: string,
  rateLimits: {
    perMinute: number;
    perHour: number;
    perDay: number;
  }
): Promise<{
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: Date;
}> {
  const now = new Date();

  // Check last minute
  const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
  const requestsLastMinute = await prisma.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(*) as count
    FROM api_request_logs
    WHERE api_key_id = ${apiKeyId}
    AND created_at >= ${oneMinuteAgo}
  `;

  const countLastMinute = Number(requestsLastMinute[0]?.count || 0);

  if (countLastMinute >= rateLimits.perMinute) {
    return {
      allowed: false,
      limit: rateLimits.perMinute,
      remaining: 0,
      resetAt: new Date(now.getTime() + 60 * 1000),
    };
  }

  // Check last hour
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const requestsLastHour = await prisma.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(*) as count
    FROM api_request_logs
    WHERE api_key_id = ${apiKeyId}
    AND created_at >= ${oneHourAgo}
  `;

  const countLastHour = Number(requestsLastHour[0]?.count || 0);

  if (countLastHour >= rateLimits.perHour) {
    return {
      allowed: false,
      limit: rateLimits.perHour,
      remaining: 0,
      resetAt: new Date(now.getTime() + 60 * 60 * 1000),
    };
  }

  return {
    allowed: true,
    limit: rateLimits.perMinute,
    remaining: rateLimits.perMinute - countLastMinute,
    resetAt: new Date(now.getTime() + 60 * 1000),
  };
}

/**
 * Log API request
 */
export async function logApiRequest(
  apiKeyId: string,
  request: NextRequest,
  statusCode: number,
  responseTimeMs: number,
  error?: string
) {
  try {
    const method = request.method;
    const endpoint = new URL(request.url).pathname;
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip');
    const userAgent = request.headers.get('user-agent');

    await prisma.$executeRaw`
      INSERT INTO api_request_logs (
        id, api_key_id, method, endpoint, status_code,
        response_time_ms, ip_address, user_agent, error_message
      ) VALUES (
        ${crypto.randomUUID()},
        ${apiKeyId},
        ${method},
        ${endpoint},
        ${statusCode},
        ${responseTimeMs},
        ${ipAddress},
        ${userAgent},
        ${error || null}
      )
    `;

    // Update daily stats
    const today = new Date().toISOString().split('T')[0];
    await prisma.$executeRaw`
      INSERT INTO api_usage_stats (
        id, api_key_id, date, total_requests,
        successful_requests, failed_requests
      ) VALUES (
        ${crypto.randomUUID()},
        ${apiKeyId},
        ${today}::DATE,
        1,
        ${statusCode < 400 ? 1 : 0},
        ${statusCode >= 400 ? 1 : 0}
      )
      ON CONFLICT (api_key_id, date)
      DO UPDATE SET
        total_requests = api_usage_stats.total_requests + 1,
        successful_requests = api_usage_stats.successful_requests + ${statusCode < 400 ? 1 : 0},
        failed_requests = api_usage_stats.failed_requests + ${statusCode >= 400 ? 1 : 0},
        updated_at = NOW()
    `;
  } catch (error) {
    console.error('Error logging API request:', error);
  }
}

/**
 * Generate new API key
 */
export function generateApiKey(environment: 'production' | 'sandbox'): string {
  const prefix = environment === 'production' ? 'grsk_live_' : 'grsk_test_';
  const randomBytes = crypto.randomBytes(32).toString('hex');
  return prefix + randomBytes;
}

/**
 * Check if API key has required scope
 */
export function hasScope(apiKey: ApiKeyData, requiredScope: string): boolean {
  return apiKey.scopes.includes(requiredScope) || apiKey.scopes.includes('*');
}


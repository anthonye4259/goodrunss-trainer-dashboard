# 🚀 Production Services Setup Guide

Complete setup for Resend (emails), Sentry (error monitoring), and Redis (caching).

---

## 1️⃣ RESEND - Email Service (5 minutes)

### Step 1: Sign Up
1. Go to https://resend.com
2. Sign up with your email
3. Verify your email address

### Step 2: Get API Key
1. Go to **API Keys** in dashboard
2. Click **Create API Key**
3. Name it: "GoodRunss Production"
4. Copy the key (starts with `re_...`)

### Step 3: Add to Environment
Add to your `.env` file:
```bash
RESEND_API_KEY=re_your_actual_key_here
```

Add to Vercel:
```bash
# Go to: https://vercel.com/your-project/settings/environment-variables
# Add: RESEND_API_KEY = re_your_actual_key_here
```

### Step 4: Verify
The code is already written in:
- `lib/send-email.ts` - Resend integration ready
- `app/api/verify-payment/route.ts` - Calls sendEmail after booking

✅ **Done!** Emails will now send automatically.

**Free Tier:**
- 100 emails/day
- Perfect for soft launch
- Upgrade to 50,000/month for $20

---

## 2️⃣ SENTRY - Error Monitoring (10 minutes)

### Step 1: Sign Up
1. Go to https://sentry.io
2. Sign up (free for 5,000 errors/month)
3. Create new project → Select **Next.js**

### Step 2: Auto-Setup
Run this in your terminal:
```bash
cd /Users/anthonyedwards/Downloads/dashboard
npx @sentry/wizard@latest -i nextjs
```

This will:
- Install Sentry SDK
- Create config files
- Add environment variables
- Set up source maps

### Step 3: Add to Vercel
The wizard will give you these keys:
```bash
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_AUTH_TOKEN=xxx
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
```

Add them to Vercel environment variables.

### Step 4: Verify
1. Deploy to Vercel
2. Cause an error (click broken link)
3. Check Sentry dashboard - error should appear!

✅ **Done!** You'll get real-time error alerts.

**Free Tier:**
- 5,000 errors/month
- 1 user
- Perfect for MVP

---

## 3️⃣ REDIS - Caching Layer (15 minutes)

### Why Redis?
- **Rate Limiting** - Prevent API abuse
- **Session Caching** - Faster user lookups
- **Query Caching** - Reduce database load
- **Real-time Features** - Live updates

### Option A: Upstash (Recommended - Easiest)

#### Step 1: Sign Up
1. Go to https://upstash.com
2. Sign up with GitHub
3. Click **Create Database**

#### Step 2: Create Redis Database
1. Name: `goodrunss-prod`
2. Region: **US-East-1** (same as your Supabase)
3. Type: **Regional**
4. Click **Create**

#### Step 3: Get Connection Details
1. Copy **UPSTASH_REDIS_REST_URL**
2. Copy **UPSTASH_REDIS_REST_TOKEN**

#### Step 4: Add to Environment
Add to `.env`:
```bash
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx
```

Add to Vercel:
```bash
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx
```

#### Step 5: Install Package
```bash
npm install @upstash/redis
```

#### Step 6: Create Redis Client
Create `lib/redis.ts`:
```typescript
import { Redis } from "@upstash/redis"

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Helper functions
export async function getCached<T>(key: string): Promise<T | null> {
  const cached = await redis.get(key)
  return cached as T | null
}

export async function setCache(
  key: string,
  value: any,
  ttlSeconds: number = 3600
): Promise<void> {
  await redis.set(key, value, { ex: ttlSeconds })
}

export async function deleteCache(key: string): Promise<void> {
  await redis.del(key)
}

// Rate limiting
export async function checkRateLimit(
  identifier: string,
  limit: number = 10,
  windowSeconds: number = 60
): Promise<{ success: boolean; remaining: number }> {
  const key = `ratelimit:${identifier}`
  const count = await redis.incr(key)
  
  if (count === 1) {
    await redis.expire(key, windowSeconds)
  }
  
  return {
    success: count <= limit,
    remaining: Math.max(0, limit - count),
  }
}
```

**Free Tier:**
- 10,000 commands/day
- 256MB storage
- Perfect for MVP

---

### Option B: Vercel KV (Alternative)

Vercel offers Redis built-in:

#### Step 1: Enable in Vercel
1. Go to your project on Vercel
2. Click **Storage** tab
3. Click **Create Database**
4. Select **KV** (Redis)
5. Name: `goodrunss-cache`

#### Step 2: Auto-Connected
Vercel automatically adds these to your environment:
```bash
KV_URL=
KV_REST_API_URL=
KV_REST_API_TOKEN=
KV_REST_API_READ_ONLY_TOKEN=
```

#### Step 3: Install Package
```bash
npm install @vercel/kv
```

#### Step 4: Create Client
Create `lib/redis.ts`:
```typescript
import { kv } from "@vercel/kv"

export const redis = kv

// Same helper functions as above
export async function getCached<T>(key: string): Promise<T | null> {
  return await kv.get<T>(key)
}

export async function setCache(
  key: string,
  value: any,
  ttlSeconds: number = 3600
): Promise<void> {
  await kv.set(key, value, { ex: ttlSeconds })
}

export async function deleteCache(key: string): Promise<void> {
  await kv.del(key)
}

export async function checkRateLimit(
  identifier: string,
  limit: number = 10,
  windowSeconds: number = 60
): Promise<{ success: boolean; remaining: number }> {
  const key = `ratelimit:${identifier}`
  const count = await kv.incr(key)
  
  if (count === 1) {
    await kv.expire(key, windowSeconds)
  }
  
  return {
    success: count <= limit,
    remaining: Math.max(0, limit - count),
  }
}
```

**Pricing:**
- Free: First 30 KiB
- Pro: 512 MiB ($0.25/GB after)

---

## 🎯 Usage Examples

### 1. Cache Trainer Profile
```typescript
// app/api/dashboard/stats/route.ts
import { getCached, setCache } from "@/lib/redis"

export async function GET(request: NextRequest) {
  const trainer = await getOrCreateUser()
  
  // Try cache first
  const cached = await getCached<any>(`trainer:${trainer.id}:stats`)
  if (cached) {
    return NextResponse.json(cached)
  }
  
  // Fetch from database
  const stats = await fetchStatsFromDB(trainer.id)
  
  // Cache for 5 minutes
  await setCache(`trainer:${trainer.id}:stats`, stats, 300)
  
  return NextResponse.json(stats)
}
```

### 2. Rate Limit Public API
```typescript
// app/api/public/trainer/[trainerId]/route.ts
import { checkRateLimit } from "@/lib/redis"

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown"
  
  // 100 requests per minute per IP
  const { success, remaining } = await checkRateLimit(ip, 100, 60)
  
  if (!success) {
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      { 
        status: 429,
        headers: { "X-RateLimit-Remaining": remaining.toString() }
      }
    )
  }
  
  // Continue with request...
}
```

### 3. Cache Services List
```typescript
// app/api/public/services/[trainerId]/route.ts
import { getCached, setCache, deleteCache } from "@/lib/redis"

export async function GET(request: NextRequest, context: any) {
  const { trainerId } = await context.params
  
  // Try cache
  const cached = await getCached(`services:${trainerId}`)
  if (cached) return NextResponse.json(cached)
  
  // Fetch from DB
  const services = await prisma.trainer_services.findMany({
    where: { trainerId, isActive: true },
  })
  
  // Cache for 1 hour
  await setCache(`services:${trainerId}`, services, 3600)
  
  return NextResponse.json(services)
}

export async function POST(request: NextRequest, context: any) {
  const { trainerId } = await context.params
  
  // Update services...
  
  // Invalidate cache
  await deleteCache(`services:${trainerId}`)
  
  return NextResponse.json({ success: true })
}
```

---

## 📊 Recommended Caching Strategy

### Cache These (High Traffic):
- ✅ Trainer profiles - 5 minutes
- ✅ Services list - 1 hour
- ✅ Availability - 10 minutes
- ✅ Dashboard stats - 2 minutes
- ✅ Public trainer pages - 5 minutes

### Don't Cache These (Real-time):
- ❌ Bookings (need instant updates)
- ❌ Payments (security sensitive)
- ❌ Messages (real-time chat)
- ❌ Session status changes

---

## 🚀 Deployment Checklist

### 1. Add Environment Variables
```bash
# Resend (Email)
RESEND_API_KEY=re_xxx

# Sentry (Errors)
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_AUTH_TOKEN=xxx
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project

# Redis (Caching)
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx
```

### 2. Install Packages
```bash
npm install @upstash/redis resend @sentry/nextjs
```

### 3. Deploy
```bash
git add -A
git commit -m "Add: Production services (Resend, Sentry, Redis)"
git push origin main
```

---

## 💰 Total Monthly Cost (Soft Launch)

| Service | Free Tier | Paid (if needed) |
|---------|-----------|------------------|
| **Resend** | 100 emails/day | $20/mo (50k emails) |
| **Sentry** | 5,000 errors/month | $26/mo (50k errors) |
| **Upstash Redis** | 10,000 commands/day | $0.20/100k commands |
| **Total** | **$0/month** | **~$46/month** at scale |

**Start free, upgrade as you grow!** 🎉

---

## 🎯 Priority Order

### Do NOW (Before Launch):
1. ✅ **Resend** - Customers need booking confirmations
2. ✅ **Sentry** - Need to catch bugs in production

### Do SOON (After 100 users):
3. ✅ **Redis** - Performance optimization

---

## 🆘 Need Help?

- **Resend Docs:** https://resend.com/docs
- **Sentry Docs:** https://docs.sentry.io/platforms/javascript/guides/nextjs/
- **Upstash Docs:** https://docs.upstash.com/redis
- **Vercel KV Docs:** https://vercel.com/docs/storage/vercel-kv

---

**Start with Resend and Sentry today!** 🚀  
**Add Redis when you hit 1,000 users.** 📈


# 🚀 Production Deployment Checklist

Complete this checklist before deploying to production and selling on the GoodRunss website.

## ✅ Authentication Setup (Clerk)

### 1. Create Clerk Account & Application
- [ ] Go to https://dashboard.clerk.com
- [ ] Create a new application for "GoodRunss Trainer Dashboard"
- [ ] Enable Email/Password authentication
- [ ] Enable Google OAuth (optional, for social login)

### 2. Add Clerk Keys to Production .env
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_KEY_HERE
CLERK_SECRET_KEY=sk_live_YOUR_LIVE_KEY_HERE
```

### 3. Configure Clerk Redirect URLs
In Clerk Dashboard > Paths, set:
- Sign-in URL: `/sign-in`
- Sign-up URL: `/sign-up`  
- After sign-in: `/onboarding`
- After sign-up: `/onboarding`

---

## 💳 Stripe Configuration

### 1. Webhook Setup (CRITICAL!)
Once you deploy to production:

1. Go to Stripe Dashboard > Developers > Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events to listen for:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `customer.subscription.deleted`
4. Copy the webhook signing secret
5. Add to `.env`:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE
   ```

### 2. Verify Price IDs
Ensure these match your Stripe products (already configured):
```bash
STRIPE_PRICE_ID_3_MONTHS=price_1SSrQm06I3eFkRUm0XIIzC2u
STRIPE_PRICE_ID_6_MONTHS=price_1SSrQ706I3eFkRUmALT3M9tM
STRIPE_PRICE_ID_12_MONTHS=price_1SSrP106I3eFkRUm9qZHlG8K
```

### 3. Update Stripe Checkout URLs
No action needed - already configured to use relative URLs.

---

## 🌐 Environment Variables

### Update Production URLs in .env:

```bash
# Change from localhost to your production domain
NEXT_PUBLIC_APP_URL=https://dashboard.goodrunss.com

# Or if embedding in main site:
NEXT_PUBLIC_APP_URL=https://goodrunss.com/dashboard
```

This URL is used for:
- Referral links
- Public booking links (`/book/[slug]`)
- Email links

---

## 🔐 Database (Supabase)

### Already Configured ✅
Your Supabase production database is already set up with:
- Connection pooling (pgbouncer)
- Direct connection for migrations
- All tables created and migrated

**No action needed** - just verify `.env` has:
```bash
DATABASE_URL="postgresql://postgres.akxwxsjoahopnplynzzb:Galagay1%24@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres:Galagay1%24@db.akxwxsjoahopnplynzzb.supabase.co:5432/postgres"
```

---

## 📧 Email Configuration

### Already Configured ✅
Resend is set up for:
- Referral emails
- Booking confirmations
- System notifications

**Verify in .env:**
```bash
RESEND_API_KEY=re_f7VW2cJV_JiCGHj6RaJRH6n6QqZgHBGSz
RESEND_FROM_EMAIL=GoodRunss <anthony@goodrunss.com>
```

---

## 🔔 Firebase (Push Notifications)

### Already Configured ✅
Firebase is set up for push notifications.

**No action needed** - credentials are in `.env`

---

## 🤖 AI Features (Claude API)

### Already Configured ✅
Anthropic Claude API is set up for:
- GIA content generation
- AI workout plans
- Smart rescheduling

**Verify in .env:**
```bash
ANTHROPIC_API_KEY=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
```

---

## 🎯 Deployment Steps

### 1. Choose Hosting Platform
Recommended: **Vercel** (optimized for Next.js)

Alternative: Netlify, Railway, AWS Amplify

### 2. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd /Users/anthonyedwards/Downloads/goodrunss-apps/goodrunss-trainer-dashboard
vercel --prod
```

### 3. Add Environment Variables in Vercel
Go to Vercel Dashboard > Your Project > Settings > Environment Variables

Copy ALL variables from your `.env` file, **except:**
- Don't commit `.env` to git
- Add each variable individually in Vercel dashboard

**Update these in Vercel:**
```bash
# Replace with your actual Clerk keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...

# Update to your production domain
NEXT_PUBLIC_APP_URL=https://dashboard.goodrunss.com

# Add after setting up webhook
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 4. Configure Custom Domain
- In Vercel: Settings > Domains
- Add: `dashboard.goodrunss.com`
- Update DNS with CNAME: `cname.vercel-dns.com`

---

## 🧪 Pre-Launch Testing

### Test These Flows:
- [ ] Landing page (`/welcome`) loads correctly
- [ ] Sign up flow (`/sign-up`) creates Clerk account
- [ ] After signup, redirects to `/onboarding`
- [ ] Complete onboarding (specialty, preferences, business info)
- [ ] After onboarding, see checkout page
- [ ] Test Stripe checkout (use test card: `4242 4242 4242 4242`)
- [ ] Verify dashboard loads after payment
- [ ] Test public booking link generation
- [ ] Test client booking flow from public page
- [ ] Test all dashboard features (clients, sessions, AI, etc.)

---

## 📱 Embedding in GoodRunss Website

If embedding the dashboard as an iframe or subdomain:

### Option 1: Subdomain (Recommended)
Deploy to: `dashboard.goodrunss.com`

### Option 2: Path-based
Deploy to: `goodrunss.com/dashboard`

In this case, update your Next.js config:
```javascript
// next.config.js
module.exports = {
  basePath: '/dashboard',
  // ... other config
}
```

---

## 🔒 Security Checklist

- [ ] All API routes validate authentication (Clerk)
- [ ] Stripe webhook validates signature
- [ ] Environment variables are not committed to git
- [ ] Database uses connection pooling
- [ ] CORS configured correctly (if needed)
- [ ] Rate limiting enabled on API routes (optional, for later)

---

## 📊 Post-Launch Monitoring

### Set up monitoring for:
- [ ] **Sentry** - Already configured for error tracking
- [ ] **Stripe Dashboard** - Monitor payment success/failures
- [ ] **Vercel Analytics** - Track page views and performance
- [ ] **Supabase Dashboard** - Monitor database queries

---

## 💰 Pricing & Sales

### Early Access Pricing (Already Configured):
- **3 Months**: $40 one-time (`price_1SSrQm06I3eFkRUm0XIIzC2u`)
- **6 Months**: $80 one-time (`price_1SSrQ706I3eFkRUmALT3M9tM`) - Most Popular
- **1 Year**: $120 one-time (`price_1SSrP106I3eFkRUm9qZHlG8K`) - Best Deal

### Sales Page URL:
Point customers to: `https://dashboard.goodrunss.com/welcome`

Or embed the welcome page directly on goodrunss.com

---

## 🚨 Known Issues / Future Enhancements

### Not Blocking Launch:
- Demo video not recorded yet (placeholder page exists)
- Some advanced features still in beta

### Post-Launch:
- Add email verification flow
- Add password reset flow
- Add 2FA (available through Clerk)
- Add more AI personas
- Mobile-responsive optimization

---

## ✅ Final Checklist

Before going live:
- [ ] Clerk live keys added to production
- [ ] Stripe webhook configured with production URL
- [ ] `NEXT_PUBLIC_APP_URL` updated to production domain
- [ ] All environment variables added to Vercel
- [ ] Custom domain configured and DNS updated
- [ ] Completed test purchase with real card
- [ ] Verified onboarding flow works end-to-end
- [ ] Tested public booking system
- [ ] Checked all pages load without errors
- [ ] Sentry receiving error reports (test by triggering an error)

---

## 📞 Support

If you run into issues during deployment:
- Vercel: https://vercel.com/support
- Clerk: https://clerk.com/support
- Stripe: https://support.stripe.com
- Supabase: https://supabase.com/support

---

**You're ready to launch! 🎉**

The dashboard is fully built and production-ready. Just complete this checklist and you can start selling to trainers.


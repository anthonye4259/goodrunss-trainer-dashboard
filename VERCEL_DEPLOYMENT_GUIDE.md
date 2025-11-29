# 🚀 Vercel Deployment Guide

## ✅ Repository Status
Your code has been successfully pushed to GitHub at:
**https://github.com/anthonye4259/goodrunss-trainer-dashboard**

### Recent Fixes Applied:
- ✅ **Fixed React 19 peer dependency issue** - Added `.npmrc` with `legacy-peer-deps=true`
- ✅ **Updated vaul package** - Upgraded from 0.9.9 to 1.1.1 for better React 19 compatibility
- ✅ All changes committed and pushed to GitHub

## 📋 Pre-Deployment Checklist
- ✅ Git repository initialized
- ✅ Code committed and pushed to GitHub
- ✅ Build test passed locally
- ✅ Next.js configuration optimized for Vercel

## 🚀 Deploy to Vercel (Step-by-Step)

### 1. Connect to Vercel
1. Go to [https://vercel.com](https://vercel.com)
2. Sign in with your GitHub account
3. Click **"Add New Project"**
4. Select **"Import Git Repository"**
5. Find and select `anthonye4259/goodrunss-trainer-dashboard`

### 2. Configure Project Settings
- **Framework Preset**: Next.js (auto-detected)
- **Root Directory**: `./` (leave as default)
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `.next` (auto-detected)
- **Install Command**: `npm install` (auto-detected)

### 3. Environment Variables (REQUIRED)

Add these environment variables in Vercel:

#### **Authentication (Clerk)**
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
```

#### **Database (Supabase/PostgreSQL)**
```env
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
```

#### **Stripe (Payments)**
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### **Firebase (Real-time features)**
```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=goodrunss-ai
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...

# Firebase Admin (Server-side)
FIREBASE_PROJECT_ID=goodrunss-ai
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

#### **AI APIs (Optional for AI features)**
```env
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_GEMINI_API_KEY=...
```

#### **Email (Resend - Optional)**
```env
RESEND_API_KEY=re_...
```

#### **Sentry (Error Tracking - Optional)**
```env
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
SENTRY_AUTH_TOKEN=...
NEXT_PUBLIC_SENTRY_DSN=...
```

#### **App Configuration**
```env
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NODE_ENV=production
```

### 4. Deploy
1. Click **"Deploy"**
2. Wait 3-5 minutes for the build to complete
3. Vercel will automatically:
   - Install dependencies
   - Build the project
   - Generate static pages
   - Deploy to CDN

### 5. Post-Deployment Steps

#### A. Update Clerk Redirect URLs
1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Go to **"Domains"**
4. Add your Vercel domain: `https://your-app.vercel.app`
5. Update redirect URLs to use your Vercel domain

#### B. Update Stripe Webhooks
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Go to **"Developers" → "Webhooks"**
3. Add endpoint: `https://your-app.vercel.app/api/stripe/webhook`
4. Select events to listen for
5. Copy webhook secret and update in Vercel env vars

#### C. Setup Database (First Deploy)
```bash
# In your local terminal:
npx prisma generate
npx prisma db push
```

#### D. Update Firebase Security Rules (if needed)
Your Firebase security rules are already deployed. If you need to update them:
```bash
cd /path/to/goodrunss-facilities-portal
npx firebase-tools deploy --only firestore:rules
```

### 6. Custom Domain (Optional)
1. In Vercel dashboard, go to **"Settings" → "Domains"**
2. Add your custom domain (e.g., `dashboard.goodrunss.com`)
3. Update DNS records as instructed by Vercel
4. Vercel will automatically provision SSL certificate

## 🔧 Build Optimization

Your `next.config.ts` is already optimized with:
- ✅ `output: 'standalone'` - Reduces deployment size
- ✅ `optimizePackageImports` - Faster builds
- ✅ Sentry integration - Error tracking
- ✅ Image optimization - Remote patterns configured

## ⚠️ Build Warnings (Non-Critical)

The following warnings appear during build but won't prevent deployment:

1. **Sentry instrumentation file missing**
   - Optional: Create `instrumentation.ts` in root directory
   - Or suppress with: `SENTRY_SUPPRESS_INSTRUMENTATION_FILE_WARNING=1`

2. **Global error handler missing**
   - Optional: Create `app/global-error.tsx`
   - Or suppress with: `SENTRY_SUPPRESS_GLOBAL_ERROR_HANDLER_FILE_WARNING=1`

3. **Multiple lockfiles detected**
   - Non-critical warning about parent directory lockfile
   - Or set `outputFileTracingRoot` in `next.config.ts`

## 📊 Deployment Success Indicators

After deployment, verify:
1. ✅ Dashboard loads at your Vercel URL
2. ✅ Clerk authentication works
3. ✅ Navigation between pages works
4. ✅ No console errors
5. ✅ Images load correctly
6. ✅ API routes respond (if database is connected)

## 🐛 Common Deployment Issues

### Issue: Build fails with "Module not found"
**Solution**: Run `npm install` locally and commit `package-lock.json`

### Issue: Peer dependency conflict (React 19 vs package requirements)
**Solution**: ✅ **Already Fixed!**
- Added `.npmrc` file with `legacy-peer-deps=true`
- This allows packages like `vaul` to work with React 19
- Vercel will automatically use this configuration

### Issue: Environment variables not working
**Solution**: 
- Ensure variables start with `NEXT_PUBLIC_` for client-side access
- Redeploy after adding env vars
- Check for typos in variable names

### Issue: Database connection fails
**Solution**:
- Verify `DATABASE_URL` and `DIRECT_URL` are correct
- Run `npx prisma generate` and `npx prisma db push`
- Ensure Supabase allows connections from Vercel IPs

### Issue: Clerk authentication redirects fail
**Solution**:
- Update Clerk dashboard with Vercel domain
- Ensure all redirect URLs use HTTPS
- Check that env vars are set correctly

### Issue: Stripe webhooks not working
**Solution**:
- Verify webhook endpoint URL is correct
- Ensure `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard
- Check webhook event logs in Stripe dashboard

## 🔄 Continuous Deployment

Vercel automatically redeploys when you push to GitHub:

```bash
# Make changes locally
git add .
git commit -m "feat: your change description"
git push

# Vercel automatically:
# 1. Detects push to main branch
# 2. Runs build
# 3. Deploys if successful
# 4. Sends notification
```

## 📱 Preview Deployments

Every pull request gets a preview deployment:
- Unique URL for testing
- Isolated environment
- Perfect for QA/testing

## 🎉 You're Ready!

Your dashboard is production-ready and configured for Vercel deployment.

**Next Steps:**
1. Deploy to Vercel following the steps above
2. Configure environment variables
3. Update third-party service URLs (Clerk, Stripe)
4. Test the deployed application
5. Connect custom domain (optional)

## 📞 Need Help?

- **Vercel Docs**: [https://vercel.com/docs](https://vercel.com/docs)
- **Next.js Docs**: [https://nextjs.org/docs](https://nextjs.org/docs)
- **Deployment Issues**: Check Vercel build logs in dashboard

---

**Built with ❤️ for GoodRunss Trainers**


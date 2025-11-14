# 🚀 Deploy to Vercel - Step by Step

## Step 1: Install Vercel CLI (if you don't have it)

```bash
npm install -g vercel
```

## Step 2: Login to Vercel

```bash
vercel login
```

Follow the prompts to authenticate.

---

## Step 3: Deploy

```bash
cd /Users/anthonyedwards/Downloads/goodrunss-apps/goodrunss-trainer-dashboard
vercel --prod
```

Vercel will ask you:
1. **Set up and deploy?** → Yes
2. **Which scope?** → Your account/team
3. **Link to existing project?** → No (first time)
4. **Project name?** → goodrunss-trainer-dashboard (or whatever you want)
5. **Directory?** → Press Enter (current directory)
6. **Override settings?** → No

**Wait for deployment...** ⏳

---

## Step 4: Add Environment Variables

Once deployed, you'll get a URL like: `https://goodrunss-trainer-dashboard.vercel.app`

Now go to: https://vercel.com/dashboard

1. Click on your project: **goodrunss-trainer-dashboard**
2. Click **Settings** → **Environment Variables**
3. Add ALL these variables (copy from your `.env` file):

```bash
# Database
DATABASE_URL=postgresql://postgres.akxwxsjoahopnplynzzb:Galagay1%24@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
DIRECT_URL=postgresql://postgres:Galagay1%24@db.akxwxsjoahopnplynzzb.supabase.co:5432/postgres

# Resend (Email)
RESEND_API_KEY=re_f7VW2cJV_JiCGHj6RaJRH6n6QqZgHBGSz
RESEND_FROM_EMAIL=GoodRunss <anthony@goodrunss.com>
RESEND_REPLY_TO_EMAIL=anthony@goodrunss.com
EMAIL_FROM=GoodRunss <anthony@goodrunss.com>
EMAIL_REPLY_TO=anthony@goodrunss.com

# AI (Claude)
ANTHROPIC_API_KEY=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

# Cron/Internal
CRON_SECRET=4e336490c06a357f4efb23d3f9cb186ba3705f6a3e1eb433a8d58185d0fe30e4
INTERNAL_API_KEY=7840c50cde1bdb7dc131257110a74eb64eb8cb7eaa30f92c2363d784b55f3e44

# Stripe (Live Keys)
STRIPE_SECRET_KEY=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
STRIPE_PUBLISHABLE_KEY=pk_live_51Rfsym06I3eFkRUmipmmgFo6bqX8Al08OhJZm1N6b6UvO6ZnLUDuhOQpNNaSeJlbFAmETOt64P6oRMboXLsnm3tJ00ClGq74Lv
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51Rfsym06I3eFkRUmipmmgFo6bqX8Al08OhJZm1N6b6UvO6ZnLUDuhOQpNNaSeJlbFAmETOt64P6oRMboXLsnm3tJ00ClGq74Lv

# Stripe Price IDs
STRIPE_PRICE_ID_3_MONTHS=price_1SSrQm06I3eFkRUm0XIIzC2u
STRIPE_PRICE_ID_6_MONTHS=price_1SSrQ706I3eFkRUmALT3M9tM
STRIPE_PRICE_ID_12_MONTHS=price_1SSrP106I3eFkRUm9qZHlG8K

# Stripe Webhook (ADD AFTER STEP 5)
STRIPE_WEBHOOK_SECRET=

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_c291Z2hoLXplYnUtNjYuY2xlcmsuYWNjb3VudHMuZGV2JA
CLERK_SECRET_KEY=sk_test_uX1wPQMWEqEt5edG0rVLn3KMnkPquKsz17kYh1b3F5
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/onboarding
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# App URL (UPDATE THIS!)
NEXT_PUBLIC_APP_URL=https://goodrunss-trainer-dashboard.vercel.app

# Firebase (Push Notifications)
FIREBASE_PROJECT_ID=goodrunss-ai
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@goodrunss-ai.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQChjsAsDP8qfaWa\n0yMy/9AVbRwoq6U2d0Frj1OEhYe/hOmibXgz5L7oL23dh/TteOWlzd1lveW2+4OV\n/SLCIm8JkJkb7iqdDFeuo6vNfXTIbTYk4S/xFncSj9j4gs0zP7ykgpsLe+mTrlB6\ns/1245Jh90VO4kO5HKcZ+mAQLghUn8vHHRDUZ7wfEHph47uw5H61qvOG8ypiIWcO\nIkV2hRL6JiMy+oBTbW96dCzjixkNvornQuVJL5RZqxFM72HnupiDR2y00/xtH7cq\nab2s5BV4sc5pmneNzXjNISbTpd5SRQMh8lKjiqEDcgMzO2aHgovr3VMGEpzQ54HV\nFiw1cfqHAgMBAAECggEAD8+2wxjqiDAP2x063qzmopIxJVHXM4NsZah7VgbziCzr\n6LeqAforLPInYH0D3ZHtd9K0DlcNemEXOcCyfCl+kIMUWQVwKjqhAjiGge/7U/pM\nSEO5u3Claq2lYHz8tD1Sqw8VOYSBEbEHs1qWPeJ72xamM9g1JJLHT+WPLUY0DoQF\nPttizjMhhtuMpT2Soo0b8KHK5Z89kuCtCnAIWgYHXUNJI+/ucK2dQ38WLB3+W8tD\nmnlm5k3A7sHjmauQvkxo2zGXLcNZZVQtlthboT8bbGhJMqJGDwrnWBmoOtySeIBP\nR030hPFkwaD7tXD+fP1xZqWZyp6H+1fIT3jkekJIsQKBgQDX1eg5KvAOutxG+yEd\ni9SyA07xlC6iL/8r5FtHcf3KGK7mcyk6V0AWvWCt3tygXq/amC3En6CWYqHNTuTl\n8W0BZBX912J6vs4F+QeorShsExGn+1xcLA2+5pzhEtXboR8FpZn/ND19jbzcbYIR\n/osk7fLTQAYV4MPRj3Y1D620xQKBgQC/nx7nZ3RV5zv2s9zioUe80mFLfaiLn6To\nlE0lsEwolGiIiNrWXWb7nit0/fg2CcEK69HHqzV1XQUuI0XbmS5Ar9Ggs6xzhlf2\nM3XwiNf5FQN3+bf5AR8ukKoYtgEMyXbIQfGEkkSwY/8tD8Ya5tgD7MscOPwPIAtG\nnOfj3Rhe2wKBgAVV0Eu5d/2lONS4WHU2g6dy1Xy7QPvZW+Fl36vAcZmRSqF/r0E1\n7uug+sbRf3qnXIl2wYret0WAYqeEj7vvX9Zs9u4zaMfH96fGJB5TSXCCeClC2WGd\n5SkW4kHeCVNIhE/LbCcWz35PBqAcRN7U//OFvj7ikkPwLmb7uNxO6uhRAoGAYTf3\n0+uXCGZS8+15KbotzUzndAeC1aPfZOio43A4k3YIOw1ECfJFZ29uGOMpZTE5sbLH\nMghZDPxuvmPC85EZ+FO7hU7jNZF5Wz3snmavPH4+zkXx4vGAwn0+716X1cb47s0W\nHe6fzuZM9q3EEq3/9q3StrTqnTnivqaot+DalnUCgYBT7O6Xzd2zCP38JO2mLJr9\n3jolfLeloT+OXyacfHD6lCzzYgBb73IA3cdCb7yHtNqtASB8HKDDv39brzRXjUAC\nKNC/WiiWbgPc3vAW7MaJ1n3MoFmqjYWb8/rvQDkA231Wgg+oC5uclStwMXWUAMLX\nIxMpWsaCT39FCtuBvjYDyw==\n-----END PRIVATE KEY-----\n"

# Sentry (Error Tracking)
NEXT_PUBLIC_SENTRY_DSN=https://f320a431c501301055f4577a3d3554b7@o4510281815556096.ingest.us.sentry.io/4510281824796672
SENTRY_ORG=goodrunss
SENTRY_PROJECT=goodrunss-trainer-dashboard
```

**Important:** For `NEXT_PUBLIC_APP_URL`, use your actual Vercel URL.

4. Click **Save** after each variable

---

## Step 5: Set Up Stripe Webhook

1. Go to https://dashboard.stripe.com/webhooks
2. Click **Add endpoint**
3. Endpoint URL: `https://your-vercel-url.vercel.app/api/webhooks/stripe`
4. Select events:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `customer.subscription.deleted`
5. Click **Add endpoint**
6. Click on the webhook you just created
7. Copy the **Signing secret** (starts with `whsec_...`)
8. Go back to Vercel → Settings → Environment Variables
9. Add: `STRIPE_WEBHOOK_SECRET=whsec_your_secret_here`
10. Click **Save**

---

## Step 6: Redeploy with New Variables

After adding all environment variables:

```bash
vercel --prod
```

This will redeploy with all your environment variables.

---

## Step 7: Test Your Deployment

1. Visit your deployment URL
2. Go to `/welcome`
3. Click "Get Early Access"
4. Sign up with a test email
5. Complete onboarding
6. Select a pricing plan
7. Use Stripe test card: `4242 4242 4242 4242`
8. Verify you land on the dashboard

---

## 🎉 You're Live!

Your dashboard is now deployed and ready to sell to trainers!

**Share this URL with trainers:** `https://your-vercel-url.vercel.app/welcome`

---

## Optional: Custom Domain

Want to use `dashboard.goodrunss.com`?

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add domain: `dashboard.goodrunss.com`
3. Update your DNS with the CNAME record Vercel provides
4. Update `NEXT_PUBLIC_APP_URL` in Vercel env vars to your custom domain
5. Redeploy: `vercel --prod`

---

## Need Help?

If you run into any issues during deployment, let me know!




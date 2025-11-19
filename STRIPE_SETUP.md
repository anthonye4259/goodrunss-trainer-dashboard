# Stripe Payment Setup 

## ✅ What I Fixed:

1. **Updated pricing structure** - Changed from old plans ($29, $79, $149) to new billing periods ($40, $75, $100)
2. **Fixed product IDs** - Now using "3-month", "6-month", "1-year" 
3. **Updated checkout page** - Dynamically loads plan details from products file
4. **Added early access messaging** - "Price locked forever" messaging

## 🔑 Required: Add Stripe API Keys to Vercel

The payment form needs these environment variables:

### 1. Get Your Stripe Keys
- Go to https://dashboard.stripe.com/test/apikeys
- Copy your **Publishable key** (starts with `pk_test_...`)
- Copy your **Secret key** (starts with `sk_test_...`)

### 2. Add to Vercel
Go to your Vercel dashboard → Project → Settings → Environment Variables

Add these two:
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
```

### 3. Redeploy
After adding env vars, trigger a new deployment (or just push a commit).

## How It Works:

1. User selects plan on `/signup` page
2. Clicks "Get Started" → goes to `/checkout`
3. Stripe Embedded Checkout loads with payment form
4. User enters card info directly in Stripe's secure form
5. On success → redirects to `/onboarding`

## Testing:

Use Stripe test card:
- Card: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits





# Stripe Payment Integration Setup

## ✅ Features Implemented

1. **Public Booking Page** - `/book/[trainerId]`
   - Select service, date, and time
   - Beautiful calendar and time slot picker

2. **Checkout Page** - `/book/[trainerId]/checkout`
   - Client enters name, email, phone
   - Shows booking summary
   - Redirects to Stripe Checkout

3. **Payment Processing** - Secure Stripe Checkout
   - Credit card payment
   - Secure and PCI compliant
   - Mobile friendly

4. **Success Page** - `/book/[trainerId]/success`
   - Confirmation message
   - Booking details
   - Email confirmation notice

5. **Database Integration**
   - Automatically creates session in database after payment
   - Stores client information
   - Links to trainer

## 🔑 Required Environment Variables

Add these to your Vercel environment variables:

```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

## 📝 How to Get Stripe Keys

1. Go to https://dashboard.stripe.com/register
2. Create a Stripe account (free)
3. Go to **Developers** → **API Keys**
4. Copy your **Publishable key** (starts with `pk_test_`)
5. Copy your **Secret key** (starts with `sk_test_`)
6. Add both to Vercel environment variables
7. Redeploy

## 🧪 Testing Payments

Use Stripe test cards:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires auth**: `4000 0025 0000 3155`

Any future date for expiry, any 3-digit CVC, any ZIP code.

## 🚀 How It Works

1. **Client** visits your booking link
2. **Selects** service, date, time
3. **Enters** contact info on checkout page
4. **Pays** via Stripe Checkout (secure)
5. **Redirected** to success page
6. **Session created** in your database
7. **Email sent** to both trainer and client (via Stripe)

## 💰 Stripe Pricing

- **2.9% + 30¢** per successful transaction
- No monthly fees for standard plan
- You keep the rest

## 🔒 Security

- All payment data handled by Stripe
- PCI compliant out of the box
- Never store credit card numbers
- SSL encrypted

## 📧 Next Steps

After adding Stripe keys:
1. Test with test card numbers
2. When ready, switch to live keys in production
3. Set up Stripe email receipts (optional)
4. Configure webhook for advanced features (optional)

## ⚠️ Important

- Start with TEST keys
- Test thoroughly before going live
- Switch to LIVE keys only when launching
- Never commit keys to Git (use environment variables)

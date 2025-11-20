# 🚀 Stripe Free Trial Setup Guide

Your 7-day card-locked free trial is configured! Follow these steps to complete the setup.

---

## ✅ What's Already Built:

1. **Signup Flow** - Users must enter card and select plan
2. **7-Day Trial** - No charge until trial ends
3. **Trial Banner** - Shows days remaining on dashboard
4. **Subscription Management** - Users can cancel anytime
5. **Stripe Webhooks** - Handles subscription lifecycle
6. **Database** - Stores subscription status and trial dates

---

## 🔧 Required Setup Steps:

### 1. Create Stripe Products & Prices

Go to Stripe Dashboard → Products → Create Product

Create **3 products** with these settings:

#### **Product 1: 6-Month Plan**
- **Name:** GoodRunss Trainer - 6 Months
- **Description:** 6-month access to GoodRunss Trainer Dashboard
- **Pricing:**
  - Type: **One-time payment**
  - Price: **$75 USD**
  - Billing period: N/A (one-time)
- **Trial:** 7 days
- Copy the **Price ID** (starts with `price_...`)
- Add to Vercel: `STRIPE_PRICE_6_MONTH=price_xxxxx`

#### **Product 2: 1-Year Plan** (Most Popular)
- **Name:** GoodRunss Trainer - 1 Year
- **Description:** 1-year access to GoodRunss Trainer Dashboard
- **Pricing:**
  - Type: **One-time payment**
  - Price: **$120 USD**
  - Billing period: N/A (one-time)
- **Trial:** 7 days
- Copy the **Price ID** (starts with `price_...`)
- Add to Vercel: `STRIPE_PRICE_1_YEAR=price_xxxxx`

#### **Product 3: 2-Year Plan** (Best Value)
- **Name:** GoodRunss Trainer - 2 Years
- **Description:** 2-year access to GoodRunss Trainer Dashboard (Best Value)
- **Pricing:**
  - Type: **One-time payment**
  - Price: **$200 USD**
  - Billing period: N/A (one-time)
- **Trial:** 7 days
- Copy the **Price ID** (starts with `price_...`)
- Add to Vercel: `STRIPE_PRICE_2_YEAR=price_xxxxx`

---

### 2. Add Environment Variables to Vercel

```bash
STRIPE_PRICE_6_MONTH=price_xxxxx    # From Product 1
STRIPE_PRICE_1_YEAR=price_xxxxx     # From Product 2
STRIPE_PRICE_2_YEAR=price_xxxxx     # From Product 3
```

(Your STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET are already configured)

---

### 3. Update Stripe Webhook Events

Go to Stripe Dashboard → Developers → Webhooks → Select your webhook

**Add these events:**
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `customer.subscription.trial_will_end` (optional - for reminder emails)
- `invoice.payment_succeeded`
- `invoice.payment_failed`

---

## 🎯 How It Works:

### User Flow:
1. **Signup:** User enters name, email, password, business name
2. **Plan Selection:** User selects 6-month, 1-year, or 2-year plan
3. **Stripe Checkout:** User enters card details (no charge yet)
4. **Trial Starts:** 7-day trial begins immediately
5. **Access:** Full access to dashboard during trial
6. **Auto-Charge:** Card is charged on day 8 if not canceled
7. **Cancel Anytime:** User can cancel before trial ends

### Trial Banner:
- Displays "X days remaining" on dashboard
- Shows warning when ≤2 days left
- Links to subscription management page

### Subscription Management:
- View trial status and expiration date
- Cancel subscription (keeps access until trial ends)
- View plan features

---

## 🔒 Security Features:

- ✅ Card required to start trial (prevents abuse)
- ✅ Stripe handles all payment processing (PCI compliant)
- ✅ Webhooks verify subscription status
- ✅ Database tracks trial dates and subscription status
- ✅ Users can cancel anytime before charge

---

## 🧪 Testing:

Use Stripe test mode cards:
- **Success:** `4242 4242 4242 4242`
- **Decline:** `4000 0000 0000 0002`
- Use any future expiry date and any 3-digit CVC

Test trial flow:
1. Go to `/signup`
2. Enter test details
3. Select a plan
4. Enter test card `4242 4242 4242 4242`
5. Complete checkout
6. Check dashboard for trial banner
7. Go to `/subscription` to manage

---

## 📊 Monitoring:

**Stripe Dashboard:**
- View active trials: Customers → Subscriptions → Filter by "Trialing"
- Track conversions: Analytics → Subscription metrics
- Monitor cancellations: Subscriptions → Canceled

**Database:**
Check `user_subscriptions` table for:
- `status: "trialing"` - Active trials
- `trialEnd` - When trial expires
- `cancelAtPeriodEnd: true` - Users who canceled

---

## 🎉 You're Ready!

Your card-locked free trial is now live! Users can:
- Start a 7-day free trial
- Get full access immediately
- Cancel anytime before charge
- Enjoy locked-in early pricing forever

**Need help?** Check Stripe docs or contact support! 🚀


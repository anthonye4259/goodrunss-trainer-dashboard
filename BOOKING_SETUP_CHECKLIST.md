# ✅ Public Booking System - Setup Checklist

## 🎯 Goal
Launch a revenue-generating booking system **BEFORE** your consumer app goes live.

---

## 📋 Setup Steps (5 minutes)

### 1️⃣ Run Database Migration

```bash
# Open Supabase SQL Editor
# https://supabase.com/dashboard/project/YOUR_PROJECT/sql

# Copy and paste the entire contents of:
prisma/migrations/add_public_booking_system.sql

# Click "Run"
```

✅ This creates 4 new tables:
- `booking_settings`
- `trainer_availability`
- `blocked_time_slots`
- `public_bookings`

---

### 2️⃣ Configure Stripe Webhook

```bash
# 1. Go to Stripe Dashboard → Developers → Webhooks
#    https://dashboard.stripe.com/webhooks

# 2. Click "Add endpoint"

# 3. Enter endpoint URL:
#    https://yourdomain.com/api/webhooks/booking-payment

# 4. Select events to listen for:
#    ✅ checkout.session.completed
#    ✅ checkout.session.expired
#    ✅ charge.refunded

# 5. Copy the "Signing secret" (starts with whsec_...)
```

Add to your `.env` file:
```bash
STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
```

---

### 3️⃣ Test the System

#### **A. Create Booking Settings (as trainer)**

```bash
# Log in to dashboard as a trainer
# Navigate to: /dashboard/bookings

# Fill in:
- Booking Slug: "your-name" (e.g., "coach-mike")
- Display Name: "Your Name"
- Bio: "Your bio"
- Session Types:
  - 1-on-1 Training: 60 min, $75
  - Group Session: 90 min, $25

# Set Weekly Availability:
- Monday: 9:00 AM - 5:00 PM
- Wednesday: 9:00 AM - 5:00 PM
- Friday: 9:00 AM - 5:00 PM

# Click "Save Settings"
```

#### **B. Copy Your Booking Link**

Your link will be: `https://yourdomain.com/book/coach-mike`

#### **C. Test Booking Flow (as client)**

1. Open your booking link in incognito mode
2. Select a session type
3. Pick an available time slot
4. Enter client details
5. Click "Continue to Payment"
6. Use Stripe test card: `4242 4242 4242 4242`
7. Complete payment
8. Should redirect to success page

#### **D. Verify Booking (as trainer)**

1. Go to `/dashboard/bookings`
2. Should see the new booking with status "confirmed"
3. Payment status should be "paid"

---

## 🚀 Launch Checklist

### Before Going Live:

- [ ] Database migration completed
- [ ] Stripe webhook configured and tested
- [ ] At least 1 trainer has set up their booking page
- [ ] Test booking completed successfully
- [ ] Email confirmation works (optional for MVP)
- [ ] Mobile-responsive design tested

### Marketing Launch:

- [ ] Share booking links on Instagram/Twitter
- [ ] Add booking link to trainer bios
- [ ] Create landing page explaining the service
- [ ] Track bookings and revenue in dashboard

---

## 📊 What to Track

Key metrics to monitor:

1. **Bookings Created** - Total number of bookings
2. **Conversion Rate** - Page visits → completed bookings
3. **Average Booking Value** - Total revenue / total bookings
4. **Cancellation Rate** - Cancelled bookings / total bookings
5. **Trainer Adoption** - Number of trainers with active booking pages
6. **Revenue Generated** - Total payment volume

---

## 💰 Revenue Strategy

### Pricing Model Options:

**Option 1: Platform Fee**
- Trainers keep 85-90% of booking value
- GoodRunss takes 10-15% per booking
- Implementation: Add `application_fee_amount` to Stripe Checkout

**Option 2: Subscription + Bookings**
- Trainers pay for dashboard subscription ($40-120)
- Keep 100% of booking revenue
- Better for trainer retention

**Option 3: Hybrid**
- Small subscription ($40/3mo)
- Small platform fee (5%)
- Best of both worlds

---

## 🎨 Frontend Pages Built

### 1. Trainer Dashboard (`/dashboard/bookings`)
- Booking settings configuration
- Weekly availability manager
- Session types editor
- Bookings list with filters
- Revenue stats

### 2. Public Booking Page (`/book/[slug]`)
- Trainer profile display
- Session type selector
- Real-time availability calendar
- Booking form
- Stripe payment integration

### 3. Success Page (`/book/[slug]/success`)
- Confirmation message
- Next steps
- Booking summary

---

## 🔧 API Endpoints

### Trainer (Auth Required):
- `GET /api/booking-settings` - Fetch settings
- `POST /api/booking-settings` - Create/update settings
- `GET /api/booking-availability` - Fetch availability
- `POST /api/booking-availability` - Add time slot
- `DELETE /api/booking-availability?id=xxx` - Remove slot
- `GET /api/my-bookings` - View bookings
- `PATCH /api/my-bookings?id=xxx` - Update booking status

### Public (No Auth):
- `GET /api/book/[slug]/info` - Trainer info + session types
- `GET /api/book/[slug]/slots?sessionTypeId=xxx` - Available slots
- `POST /api/book/[slug]/book` - Create booking + payment

### Webhooks:
- `POST /api/webhooks/booking-payment` - Stripe payment webhook

---

## 🐛 Troubleshooting

### "Booking slug already taken"
- Each trainer needs a unique slug
- Try: `firstname-lastname` or `firstname-sport`

### "No available slots"
- Check that availability is set in dashboard
- Verify time zone settings
- Ensure advance booking days is reasonable (30 days default)

### "Payment not confirming"
- Check Stripe webhook is configured correctly
- Verify webhook secret in `.env`
- Check webhook logs in Stripe dashboard

### "Trainer not found"
- Ensure booking settings `isActive` is `true`
- Check slug spelling is exact
- Verify trainer has created settings

---

## 📱 Mobile Optimization

The booking page is mobile-responsive but consider:

1. **Mobile-first testing** - 70% of bookings will be mobile
2. **Fast loading** - Optimize images and API calls
3. **Easy payment** - Apple Pay / Google Pay integration
4. **Calendar integration** - Add to Apple Calendar / Google Calendar

---

## 🎯 Success Metrics

### Week 1 (Soft Launch):
- **Goal:** 5 trainers set up booking pages
- **Goal:** 10 total bookings
- **Goal:** $500 in booking revenue

### Week 2-4 (Beta Launch):
- **Goal:** 50 trainers with booking pages
- **Goal:** 100 total bookings
- **Goal:** $5,000 in booking revenue

### Month 2 (Public Launch):
- **Goal:** 200+ trainers
- **Goal:** 500+ bookings/month
- **Goal:** $25,000+ monthly booking volume

---

## 🚨 Critical Production Settings

Before deploying:

```bash
# .env - Add these if not already set:
NEXT_PUBLIC_APP_URL=https://yourdomain.com
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Database - Ensure connection is stable:
DATABASE_URL=your_supabase_pooler_url
DIRECT_URL=your_supabase_direct_url
```

---

## 🎉 You're Ready to Launch!

Everything is built. Run the migration, test the flow, and start generating revenue! 🚀

**Estimated Launch Time:** 2-3 hours (including testing)

**Revenue Potential:** $5,000+ in first month 💰

---

Questions? Check the main docs: `🚀_PUBLIC_BOOKING_SYSTEM_COMPLETE.md`





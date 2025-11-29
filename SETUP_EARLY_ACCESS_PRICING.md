# 🚀 Setup Early Access Pricing in Stripe

Your early access pricing is now configured! Follow these steps to create the products in Stripe and connect them to your dashboard.

---

## ✅ What Changed

### 1. **New Pricing Model** (3 Simple Options)
- **3 Months**: $40 one-time payment ($13.33/mo equivalent)
- **6 Months**: $80 one-time payment ($13.33/mo equivalent) ⭐ Most Popular
- **1 Year**: $120 one-time payment ($10/mo equivalent) 💎 Best Deal

### 2. **Files Updated**
- ✅ `src/lib/products.ts` - Frontend pricing display
- ✅ `.env` - Added 3 new Stripe Price ID variables
- ✅ `prisma/migrations/early_access_pricing.sql` - Database migration

---

## 📋 Step-by-Step Setup

### **Step 1: Create Products in Stripe Dashboard**

1. Go to https://dashboard.stripe.com/products
2. Click **"+ Add product"**

#### **Product 1: 3 Months Early Access**
- **Name**: `3 Months Early Access`
- **Description**: `Full access to GoodRunss trainer dashboard for 3 months`
- **Pricing**:
  - **Type**: One-time
  - **Price**: `$40.00 USD`
- Click **"Save product"**
- **Copy the Price ID** (starts with `price_...`)

#### **Product 2: 6 Months Early Access** ⭐
- **Name**: `6 Months Early Access`
- **Description**: `Full access to GoodRunss trainer dashboard for 6 months (Most Popular)`
- **Pricing**:
  - **Type**: One-time
  - **Price**: `$80.00 USD`
- Click **"Save product"**
- **Copy the Price ID** (starts with `price_...`)

#### **Product 3: 1 Year Early Access** 💎
- **Name**: `1 Year Early Access`
- **Description**: `Full access to GoodRunss trainer dashboard for 1 year (Best Deal)`
- **Pricing**:
  - **Type**: One-time
  - **Price**: `$120.00 USD`
- Click **"Save product"**
- **Copy the Price ID** (starts with `price_...`)

---

### **Step 2: Update Your .env File**

Replace the placeholder values with your actual Stripe Price IDs:

```bash
# In .env file
STRIPE_PRICE_ID_3_MONTHS=price_1ABC123...   # Replace with your 3-month Price ID
STRIPE_PRICE_ID_6_MONTHS=price_1DEF456...   # Replace with your 6-month Price ID
STRIPE_PRICE_ID_12_MONTHS=price_1GHI789...  # Replace with your 12-month Price ID
```

---

### **Step 3: Update Database Migration**

Open `prisma/migrations/early_access_pricing.sql` and replace the placeholder Price IDs:

```sql
-- Line 29: Replace with your 3-month Price ID
'price_YOUR_3MONTH_STRIPE_PRICE_ID_HERE',

-- Line 65: Replace with your 6-month Price ID
'price_YOUR_6MONTH_STRIPE_PRICE_ID_HERE',

-- Line 101: Replace with your 12-month Price ID
'price_YOUR_12MONTH_STRIPE_PRICE_ID_HERE',
```

---

### **Step 4: Run the Migration in Supabase**

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New query"**
5. Copy and paste the **ENTIRE contents** of `prisma/migrations/early_access_pricing.sql`
6. Click **"Run"** ▶️

This will:
- Delete the old subscription plans (if any)
- Insert the 3 new early access plans with your Stripe Price IDs

---

### **Step 5: Restart Your Development Server**

```bash
npm run dev
```

---

## 🎨 How It Looks

### Checkout Page (`/checkout`)
- Shows 3 pricing cards side by side
- "6 Months" plan has a "Most Popular" badge
- "1 Year" plan has a "Best Deal" badge
- Clicking a plan creates a Stripe checkout session

### What Trainers See:
```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   3 Months 🚀   │  │   6 Months ⭐   │  │    1 Year 💎    │
│                 │  │  Most Popular   │  │   Best Deal     │
│      $40        │  │      $80        │  │     $120        │
│  $13.33/month   │  │  $13.33/month   │  │  $10.00/month   │
│                 │  │                 │  │                 │
│  All features   │  │  All features   │  │  All features   │
│    unlocked     │  │    unlocked     │  │    unlocked     │
│                 │  │                 │  │                 │
│  [Get Started]  │  │  [Get Started]  │  │  [Get Started]  │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

---

## 🔥 What Happens After Purchase

1. **Trainer clicks "Get Started"** on a plan
2. **Stripe Checkout opens** with the one-time payment amount
3. **Trainer completes payment**
4. **Stripe webhook fires** (you'll set this up in production)
5. **Dashboard grants access** for the purchased duration
6. **Trainer gets redirected** to `/dashboard` to start using the platform

---

## 💡 Next Steps (Optional)

### Add Subscription Logic
If you want to automatically expire access after the purchased duration:

1. Create a `subscriptions` table in Prisma:
```prisma
model Subscription {
  id        String   @id @default(uuid())
  userId    String
  planId    String   // "early-access-3mo", "early-access-6mo", "early-access-12mo"
  startDate DateTime @default(now())
  endDate   DateTime
  status    String   @default("active") // active, expired, cancelled
  
  user      User     @relation(fields: [userId], references: [id])
  
  @@map("subscriptions")
}
```

2. On successful payment (webhook), create a subscription record:
```typescript
await prisma.subscription.create({
  data: {
    userId: user.id,
    planId: "early-access-6mo",
    startDate: new Date(),
    endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months from now
    status: "active"
  }
})
```

3. Check subscription status on login:
```typescript
const activeSubscription = await prisma.subscription.findFirst({
  where: {
    userId: user.id,
    status: "active",
    endDate: { gte: new Date() }
  }
})

if (!activeSubscription) {
  // Redirect to checkout
}
```

---

## 📞 Support

If you run into any issues:
1. Double-check your Stripe Price IDs match in `.env` and `early_access_pricing.sql`
2. Verify the migration ran successfully in Supabase
3. Check your Stripe Dashboard → Products to confirm the products were created

---

## 🎉 You're Ready!

Your early access pricing is now live. Trainers can purchase:
- ✅ 3 months for $40
- ✅ 6 months for $80
- ✅ 12 months for $120

All with **unlimited access** to every feature! 🚀














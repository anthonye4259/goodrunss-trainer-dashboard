# 🚀 SUBSCRIPTION SYSTEM - NEXT STEPS

## ✅ WHAT'S BEEN BUILT

All subscription system code is complete and ready:

- ✅ Database models (4 tables)
- ✅ API endpoints (10+ routes)
- ✅ Stripe Billing integration
- ✅ Subscription middleware
- ✅ Usage tracking
- ✅ Webhook handlers
- ✅ Access control
- ✅ Feature gating

---

## 📋 NEXT STEPS TO GO LIVE

### **Step 1: Run Database Migration** 🗄️

You need to create the subscription tables in your database.

**Option A: Using Supabase SQL Editor (Easiest)**

1. Go to: https://supabase.com/dashboard/project/akxwxsjoahopnplynzzb/sql
2. Open the file: `MIGRATION_SUBSCRIPTIONS.sql`
3. Copy all the SQL
4. Paste into Supabase SQL Editor
5. Click "Run"

**Option B: Using Prisma (If you fix schema conflicts)**

```bash
cd ~/Downloads/goodrunss-apps/goodrunss-trainer-dashboard
npx prisma db push
```

Note: Currently there are some table conflicts (analytics views). Using the SQL migration is safer.

---

### **Step 2: Create Stripe Products & Price IDs** 💳

You need to create recurring products in Stripe:

1. **Go to Stripe Dashboard**: https://dashboard.stripe.com/test/products

2. **Create 3 Products:**

#### **Product 1: GoodRunss Basic**
- Click "Add product"
- Name: `GoodRunss Basic`
- Description: `Perfect for casual athletes - Multi-sport AI coaching`
- **Recurring Prices:**
  - Monthly: `$4.99` → Copy Price ID (e.g., `price_xxxMonthlyBasic`)
  - Yearly: `$47.90` → Copy Price ID (e.g., `price_xxxYearlyBasic`)

#### **Product 2: GoodRunss Pro** ⭐
- Name: `GoodRunss Pro`
- Description: `For serious athletes - Unlimited AI personas & 10% off bookings`
- **Recurring Prices:**
  - Monthly: `$14.99` → Copy Price ID
  - Yearly: `$143.90` → Copy Price ID

#### **Product 3: GoodRunss Elite** 👑
- Name: `GoodRunss Elite`
- Description: `White-glove service - 20% off bookings & concierge features`
- **Recurring Prices:**
  - Monthly: `$29.99` → Copy Price ID
  - Yearly: `$287.90` → Copy Price ID

---

### **Step 3: Update Plans with Stripe Price IDs** 🔗

After creating the Stripe products, update your database:

**Go to Supabase SQL Editor** and run:

```sql
-- Update Basic plan
UPDATE subscription_plans 
SET 
  "stripePriceIdMonthly" = 'price_xxxMonthlyBasic',
  "stripePriceIdYearly" = 'price_xxxYearlyBasic'
WHERE name = 'basic';

-- Update Pro plan
UPDATE subscription_plans 
SET 
  "stripePriceIdMonthly" = 'price_xxxMonthlyPro',
  "stripePriceIdYearly" = 'price_xxxYearlyPro'
WHERE name = 'pro';

-- Update Elite plan
UPDATE subscription_plans 
SET 
  "stripePriceIdMonthly" = 'price_xxxMonthlyElite',
  "stripePriceIdYearly" = 'price_xxxYearlyElite'
WHERE name = 'elite';
```

Replace `price_xxx...` with your actual Stripe Price IDs.

---

### **Step 4: Test Subscription Flow** 🧪

Test the complete subscription flow:

```bash
# 1. Get available plans
curl http://localhost:3000/api/subscriptions/plans

# 2. Subscribe to a plan
curl -X POST http://localhost:3000/api/subscriptions/subscribe \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test_user_123",
    "userEmail": "test@example.com",
    "planName": "pro",
    "billingCycle": "monthly"
  }'

# This will return a checkoutUrl - open it in browser to complete checkout

# 3. Check subscription status
curl "http://localhost:3000/api/subscriptions/status?userId=test_user_123"

# 4. Check feature access
curl -X POST http://localhost:3000/api/subscriptions/check-access \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test_user_123",
    "featureType": "ai_persona_session"
  }'
```

---

### **Step 5: Set Up Webhooks (Production Only)** 🎣

**IMPORTANT**: Only do this when you deploy to production!

1. **Go to**: https://dashboard.stripe.com/webhooks
2. **Click**: "Add endpoint"
3. **Endpoint URL**: `https://yourdomain.com/api/stripe/webhooks`
4. **Select events**:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `customer.subscription.trial_will_end`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. **Copy the Webhook Signing Secret**
6. **Add to `.env`**:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

---

### **Step 6: Integrate in Mobile App** 📱

Update your consumer app to use subscriptions:

```typescript
// 1. Check user's subscription on app launch
const { plan, limits } = await fetch(`${API_URL}/subscriptions/status?userId=${userId}`);

// 2. Before using AI features, check access
const access = await fetch(`${API_URL}/subscriptions/check-access`, {
  method: 'POST',
  body: JSON.stringify({ userId, featureType: 'ai_persona_session' })
});

if (!access.hasAccess) {
  // Show upgrade modal
  showUpgradePrompt(access.recommendedPlan);
}

// 3. Subscribe to a plan
const { checkoutUrl } = await fetch(`${API_URL}/subscriptions/subscribe`, {
  method: 'POST',
  body: JSON.stringify({
    userId,
    userEmail,
    planName: 'pro',
    billingCycle: 'monthly'
  })
});

// Open Stripe Checkout
openURL(checkoutUrl);
```

---

## 📊 TESTING CHECKLIST

- [ ] Database migration completed
- [ ] Stripe products created
- [ ] Price IDs updated in database
- [ ] Can fetch plans via API
- [ ] Can create checkout session
- [ ] Stripe checkout completes successfully
- [ ] Subscription created in database
- [ ] Can check subscription status
- [ ] Can check feature access
- [ ] Usage tracking works
- [ ] Booking discount applies
- [ ] Can upgrade plan
- [ ] Can cancel subscription
- [ ] Webhooks configured (production)

---

## 🎯 CURRENT STATUS

```
✅ Backend Code: 100% COMPLETE
⚠️  Database: NEEDS MIGRATION (Step 1)
⚠️  Stripe Setup: NEEDS PRODUCTS (Step 2-3)
⚠️  Testing: READY AFTER STEPS 1-3
⚠️  Webhooks: PRODUCTION ONLY (Step 5)
```

---

## 💰 PRICING SUMMARY

| Plan | Monthly | Yearly (Save 20%) | Trial | Discount |
|------|---------|-------------------|-------|----------|
| Free | $0 | $0 | - | 0% |
| Basic | $4.99 | $47.90 | 14 days | 0% |
| Pro | $14.99 | $143.90 | 14 days | 10% |
| Elite | $29.99 | $287.90 | 14 days | 20% |

---

## 🚀 REVENUE POTENTIAL

**At 10,000 users:**
- Free: 5,000 (50%) = $0
- Basic: 2,500 (25%) = $12,475/mo
- Pro: 2,000 (20%) = $29,980/mo
- Elite: 500 (5%) = $14,995/mo

**Total MRR**: **$57,450**  
**Total ARR**: **$689,400**

**At 100,000 users** = **$6.9M ARR** 🎉

---

## 📚 DOCUMENTATION

Full documentation: `💎_SUBSCRIPTIONS_COMPLETE.md`

API endpoints, database models, middleware usage, and examples all included!

---

## ✨ READY TO LAUNCH!

Everything is built. Just follow Steps 1-3 above and you're live! 🚀


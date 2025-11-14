-- ═══════════════════════════════════════════════════════════════════════
-- 💳 STRIPE SUBSCRIPTION PLANS - Add Price IDs
-- ═══════════════════════════════════════════════════════════════════════
-- Run this to populate your subscription plans with Stripe Price IDs
-- ═══════════════════════════════════════════════════════════════════════

-- Clear existing plans (if any)
DELETE FROM "subscription_plans";

-- ═══════════════════════════════════════════════════════════════════════
-- 1️⃣ FREE PLAN (No Stripe, handled in code)
-- ═══════════════════════════════════════════════════════════════════════

INSERT INTO "subscription_plans" (
    id,
    name,
    "displayName",
    description,
    "priceMonthly",
    "priceYearly",
    "stripePriceIdMonthly",
    "stripePriceIdYearly",
    features,
    "giaQueriesPerDay",
    "aiPersonasPerDay",
    "aiWorkoutPlansPerMonth",
    "bookingDiscountPercent",
    "isActive",
    "sortOrder",
    "createdAt",
    "updatedAt"
) VALUES (
    'free',
    'free',
    'Free',
    'Basic features for new trainers',
    0.00,
    0.00,
    NULL,
    NULL,
    '["Basic client management", "Up to 5 clients", "Email support"]'::jsonb,
    5,
    0,
    0,
    0,
    true,
    1,
    NOW(),
    NOW()
);

-- ═══════════════════════════════════════════════════════════════════════
-- 2️⃣ STARTER PLAN - $19/month or $190/year
-- ═══════════════════════════════════════════════════════════════════════

INSERT INTO "subscription_plans" (
    id,
    name,
    "displayName",
    description,
    "priceMonthly",
    "priceYearly",
    "stripePriceIdMonthly",
    "stripePriceIdYearly",
    features,
    "giaQueriesPerDay",
    "aiPersonasPerDay",
    "aiWorkoutPlansPerMonth",
    "bookingDiscountPercent",
    "isActive",
    "sortOrder",
    "createdAt",
    "updatedAt"
) VALUES (
    'starter',
    'starter',
    'Starter',
    'For growing trainers',
    19.00,
    190.00,
    'price_1SRmXn06I3eFkRUmjvq7zVvv',
    'price_1SRmdX06I3eFkRUm0nWy9KJR',
    '["All Free features", "Up to 20 clients", "Basic analytics", "Calendar sync", "Priority email support"]'::jsonb,
    20,
    1,
    5,
    5,
    true,
    2,
    NOW(),
    NOW()
);

-- ═══════════════════════════════════════════════════════════════════════
-- 3️⃣ PRO PLAN - $49/month or $490/year ⭐ (Most Popular)
-- ═══════════════════════════════════════════════════════════════════════

INSERT INTO "subscription_plans" (
    id,
    name,
    "displayName",
    description,
    "priceMonthly",
    "priceYearly",
    "stripePriceIdMonthly",
    "stripePriceIdYearly",
    features,
    "giaQueriesPerDay",
    "aiPersonasPerDay",
    "aiWorkoutPlansPerMonth",
    "bookingDiscountPercent",
    "isActive",
    "sortOrder",
    "createdAt",
    "updatedAt"
) VALUES (
    'pro',
    'pro',
    'Pro',
    'For professional trainers',
    49.00,
    490.00,
    'price_1SRmZA06I3eFkRUm4KAPyZ3i',
    'price_1SRmfq06I3eFkRUmg176ObHP',
    '["All Starter features", "Up to 100 clients", "Advanced analytics", "AI Persona creation", "Workout plan generator", "Auto-rescheduling", "Phone support"]'::jsonb,
    100,
    5,
    20,
    10,
    true,
    3,
    NOW(),
    NOW()
);

-- ═══════════════════════════════════════════════════════════════════════
-- 4️⃣ ELITE PLAN - $99/month or $990/year
-- ═══════════════════════════════════════════════════════════════════════

INSERT INTO "subscription_plans" (
    id,
    name,
    "displayName",
    description,
    "priceMonthly",
    "priceYearly",
    "stripePriceIdMonthly",
    "stripePriceIdYearly",
    features,
    "giaQueriesPerDay",
    "aiPersonasPerDay",
    "aiWorkoutPlansPerMonth",
    "bookingDiscountPercent",
    "isActive",
    "sortOrder",
    "createdAt",
    "updatedAt"
) VALUES (
    'elite',
    'elite',
    'Elite',
    'For enterprise trainers',
    99.00,
    990.00,
    'price_1SRmaD06I3eFkRUminZ0WMdx',
    'price_1SRmgS06I3eFkRUmrj1CnuvU',
    '["All Pro features", "Unlimited clients", "Unlimited bookings", "White-label branding", "Unlimited AI Personas", "API access", "Dedicated account manager", "24/7 priority support"]'::jsonb,
    -1,
    -1,
    -1,
    15,
    true,
    4,
    NOW(),
    NOW()
);

-- ═══════════════════════════════════════════════════════════════════════
-- ✅ DONE! All 4 subscription plans added with Stripe Price IDs
-- ═══════════════════════════════════════════════════════════════════════


-- ═══════════════════════════════════════════════════════════════════════
-- 🚀 EARLY ACCESS SPECIAL PRICING
-- ═══════════════════════════════════════════════════════════════════════
-- Simple pricing for early adopters:
-- - $40 for 3 months ($13.33/month equivalent)
-- - $80 for 6 months ($13.33/month equivalent)
-- - $120 for 1 year ($10/month equivalent)
-- ═══════════════════════════════════════════════════════════════════════

-- Clear existing plans
DELETE FROM "subscription_plans";

-- ═══════════════════════════════════════════════════════════════════════
-- 1️⃣ EARLY ACCESS - 3 MONTHS ($40)
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
    'early_access_3mo',
    'early_access_3mo',
    '3 Months - Early Access',
    '$40 for 3 months of full access',
    13.33,
    NULL,
    'price_1SSrQm06I3eFkRUm0XIIzC2u', -- 3 months ($40)
    NULL,
    '["Unlimited clients & sessions", "AI-powered content generation (GIA)", "Integrated payment processing", "Push notifications", "Group class management", "Video exercise library", "Client check-ins & retention tracking", "Priority support", "All features unlocked", "Early access pricing locked in"]'::jsonb,
    -1, -- unlimited
    -1, -- unlimited
    -1, -- unlimited
    0,
    true,
    1,
    NOW(),
    NOW()
);

-- ═══════════════════════════════════════════════════════════════════════
-- 2️⃣ EARLY ACCESS - 6 MONTHS ($80) ⭐ Best Value
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
    'early_access_6mo',
    'early_access_6mo',
    '6 Months - Early Access',
    '$80 for 6 months of full access',
    13.33,
    NULL,
    'price_1SSrQ706I3eFkRUmALT3M9tM', -- 6 months ($80)
    NULL,
    '["Unlimited clients & sessions", "AI-powered content generation (GIA)", "Integrated payment processing", "Push notifications", "Group class management", "Video exercise library", "Client check-ins & retention tracking", "Priority support", "All features unlocked", "Early access pricing locked in", "🌟 Best value for money"]'::jsonb,
    -1, -- unlimited
    -1, -- unlimited
    -1, -- unlimited
    0,
    true,
    2,
    NOW(),
    NOW()
);

-- ═══════════════════════════════════════════════════════════════════════
-- 3️⃣ EARLY ACCESS - 1 YEAR ($120) 💎 Maximum Commitment
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
    'early_access_12mo',
    'early_access_12mo',
    '1 Year - Early Access',
    '$120 for 1 year of full access',
    10.00,
    120.00,
    NULL,
    'price_1SSrP106I3eFkRUm9qZHlG8K', -- 12 months ($120)
    '["Unlimited clients & sessions", "AI-powered content generation (GIA)", "Integrated payment processing", "Push notifications", "Group class management", "Video exercise library", "Client check-ins & retention tracking", "Priority support", "All features unlocked", "Early access pricing locked in", "💎 Lowest monthly cost", "Full year commitment"]'::jsonb,
    -1, -- unlimited
    -1, -- unlimited
    -1, -- unlimited
    0,
    true,
    3,
    NOW(),
    NOW()
);

-- ═══════════════════════════════════════════════════════════════════════
-- ✅ DONE! Early access pricing configured
-- ═══════════════════════════════════════════════════════════════════════
-- Next steps:
-- 1. Create products in Stripe Dashboard with these prices
-- 2. Replace the placeholder STRIPE_PRICE_ID values above with your actual IDs
-- 3. Run this migration in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════════


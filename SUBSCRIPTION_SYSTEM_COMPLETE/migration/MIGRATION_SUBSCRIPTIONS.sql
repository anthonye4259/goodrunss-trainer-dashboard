-- ========================================
-- SUBSCRIPTION SYSTEM MIGRATION
-- Run this to add subscription tables
-- ========================================

-- Subscription plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  "displayName" TEXT NOT NULL,
  description TEXT,
  "priceMonthly" DOUBLE PRECISION NOT NULL,
  "priceYearly" DOUBLE PRECISION NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  "stripePriceIdMonthly" TEXT,
  "stripePriceIdYearly" TEXT,
  features JSONB NOT NULL,
  "giaQueriesPerDay" INTEGER NOT NULL DEFAULT -1,
  "aiPersonasPerDay" INTEGER NOT NULL DEFAULT -1,
  "aiWorkoutPlansPerMonth" INTEGER NOT NULL DEFAULT 0,
  "bookingDiscountPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "trialDays" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "subscription_plans_name_idx" ON subscription_plans(name);
CREATE INDEX IF NOT EXISTS "subscription_plans_isActive_idx" ON subscription_plans("isActive");

-- User subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "userEmail" TEXT NOT NULL,
  "planId" TEXT NOT NULL,
  "planName" TEXT NOT NULL,
  "stripeCustomerId" TEXT,
  "stripeSubscriptionId" TEXT UNIQUE,
  "stripePriceId" TEXT,
  status TEXT NOT NULL,
  "billingCycle" TEXT NOT NULL,
  "currentPeriodStart" TIMESTAMP(3) NOT NULL,
  "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
  "trialStart" TIMESTAMP(3),
  "trialEnd" TIMESTAMP(3),
  "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
  "canceledAt" TIMESTAMP(3),
  "cancelReason" TEXT,
  metadata JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("planId") REFERENCES subscription_plans(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  UNIQUE("userId", "planId")
);

CREATE INDEX IF NOT EXISTS "user_subscriptions_userId_idx" ON user_subscriptions("userId");
CREATE INDEX IF NOT EXISTS "user_subscriptions_stripeSubscriptionId_idx" ON user_subscriptions("stripeSubscriptionId");
CREATE INDEX IF NOT EXISTS "user_subscriptions_status_idx" ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS "user_subscriptions_currentPeriodEnd_idx" ON user_subscriptions("currentPeriodEnd");

-- Subscription usage tracking
CREATE TABLE IF NOT EXISTS subscription_usage (
  id TEXT PRIMARY KEY,
  "subscriptionId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "featureType" TEXT NOT NULL,
  "featureId" TEXT,
  metadata JSONB,
  "usedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("subscriptionId") REFERENCES user_subscriptions(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "subscription_usage_subscriptionId_idx" ON subscription_usage("subscriptionId");
CREATE INDEX IF NOT EXISTS "subscription_usage_userId_idx" ON subscription_usage("userId");
CREATE INDEX IF NOT EXISTS "subscription_usage_featureType_idx" ON subscription_usage("featureType");
CREATE INDEX IF NOT EXISTS "subscription_usage_date_idx" ON subscription_usage(date);
CREATE INDEX IF NOT EXISTS "subscription_usage_userId_date_idx" ON subscription_usage("userId", date);

-- Subscription history (for analytics)
CREATE TABLE IF NOT EXISTS subscription_history (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "userEmail" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "fromPlanId" TEXT,
  "fromPlanName" TEXT,
  "toPlanId" TEXT,
  "toPlanName" TEXT,
  "stripeEventId" TEXT,
  "stripeSubscriptionId" TEXT,
  amount DOUBLE PRECISION,
  currency TEXT,
  "billingCycle" TEXT,
  reason TEXT,
  notes TEXT,
  metadata JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "subscription_history_userId_idx" ON subscription_history("userId");
CREATE INDEX IF NOT EXISTS "subscription_history_eventType_idx" ON subscription_history("eventType");
CREATE INDEX IF NOT EXISTS "subscription_history_createdAt_idx" ON subscription_history("createdAt");

-- ========================================
-- SEED DEFAULT PLANS
-- ========================================

INSERT INTO subscription_plans (id, name, "displayName", description, "priceMonthly", "priceYearly", currency, features, "giaQueriesPerDay", "aiPersonasPerDay", "aiWorkoutPlansPerMonth", "bookingDiscountPercent", "isActive", "sortOrder", "trialDays")
VALUES 
  (
    'plan_free_001',
    'free',
    'Free',
    'Get started with GoodRunss',
    0,
    0,
    'USD',
    '{"giaQueries":"3/day","aiPersonas":"None","workoutPlans":"None","bookingDiscount":"0%","multiSportTracking":false,"environmentalAlerts":false,"advancedFilters":false,"sportCommunity":false}'::jsonb,
    3,
    0,
    0,
    0,
    true,
    0,
    0
  ),
  (
    'plan_basic_001',
    'basic',
    'Basic',
    'Perfect for casual athletes',
    4.99,
    47.90,
    'USD',
    '{"giaQueries":"Unlimited","aiPersonas":"1/day","workoutPlans":"3/month","bookingDiscount":"0%","multiSportTracking":true,"environmentalAlerts":true,"advancedFilters":true,"sportCommunity":false,"waitlistAccess":true}'::jsonb,
    -1,
    1,
    3,
    0,
    true,
    1,
    14
  ),
  (
    'plan_pro_001',
    'pro',
    'Pro',
    'For serious athletes training across multiple sports',
    14.99,
    143.90,
    'USD',
    '{"giaQueries":"Unlimited","aiPersonas":"Unlimited","workoutPlans":"Unlimited","bookingDiscount":"10%","multiSportTracking":true,"environmentalAlerts":true,"advancedFilters":true,"sportCommunity":true,"waitlistAccess":true,"priorityBooking":true,"flexibleCancellation":true,"noBookingFees":true,"voiceCoaching":true,"aiFormCheck":true,"crossTrainingPlans":true,"injuryPrevention":true,"analyticsPerSport":true,"findPartners":true,"groupClasses":true}'::jsonb,
    -1,
    -1,
    -1,
    10,
    true,
    2,
    14
  ),
  (
    'plan_elite_001',
    'elite',
    'Elite',
    'White-glove service for elite athletes',
    29.99,
    287.90,
    'USD',
    '{"giaQueries":"Unlimited","aiPersonas":"Unlimited + Custom","workoutPlans":"Unlimited","bookingDiscount":"20%","multiSportTracking":true,"environmentalAlerts":true,"advancedFilters":true,"sportCommunity":true,"waitlistAccess":true,"priorityBooking":true,"flexibleCancellation":true,"noBookingFees":true,"voiceCoaching":true,"aiFormCheck":true,"crossTrainingPlans":true,"injuryPrevention":true,"analyticsPerSport":true,"findPartners":true,"groupClasses":true,"customAIPersonas":true,"videoAnalysis":true,"proComparison":true,"tournamentPrep":true,"equipmentAI":true,"eliteTrainerAccess":true,"celebrityTrainers":true,"conciergeBooking":true,"travelMatching":true,"familyMembers":5}'::jsonb,
    -1,
    -1,
    -1,
    20,
    true,
    3,
    14
  )
ON CONFLICT (name) DO UPDATE SET
  "displayName" = EXCLUDED."displayName",
  description = EXCLUDED.description,
  "priceMonthly" = EXCLUDED."priceMonthly",
  "priceYearly" = EXCLUDED."priceYearly",
  features = EXCLUDED.features,
  "giaQueriesPerDay" = EXCLUDED."giaQueriesPerDay",
  "aiPersonasPerDay" = EXCLUDED."aiPersonasPerDay",
  "aiWorkoutPlansPerMonth" = EXCLUDED."aiWorkoutPlansPerMonth",
  "bookingDiscountPercent" = EXCLUDED."bookingDiscountPercent",
  "trialDays" = EXCLUDED."trialDays",
  "updatedAt" = CURRENT_TIMESTAMP;

-- ========================================
-- SUCCESS!
-- ========================================

SELECT 'Subscription system tables created successfully!' as message;
SELECT COUNT(*) as "Total Plans" FROM subscription_plans;


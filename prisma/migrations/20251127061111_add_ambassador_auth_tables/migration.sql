/*
  Warnings:

  - You are about to drop the column `currency` on the `trainer_services` table. All the data in the column will be lost.
  - You are about to alter the column `price` on the `trainer_services` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `DoublePrecision`.

*/
-- CreateEnum
CREATE TYPE "BookingSource" AS ENUM ('APP', 'DASHBOARD', 'WEB', 'API');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('TEXT', 'IMAGE', 'FILE', 'SYSTEM');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'CARD', 'BANK_TRANSFER', 'DIGITAL_WALLET', 'CHECK');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "SessionType" AS ENUM ('PERSONAL_TRAINING', 'GROUP_FITNESS', 'NUTRITION_COACHING', 'ONLINE_COACHING', 'WORKOUT_PLAN', 'ASSESSMENT');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CLIENT', 'TRAINER', 'ADMIN');

-- CreateEnum
CREATE TYPE "GiaProgramType" AS ENUM ('LESSON_PLAN', 'WORKOUT_PROGRAM', 'CLASS_SEQUENCE', 'DRILL_PROGRESSION');

-- CreateEnum
CREATE TYPE "ReferralStatus" AS ENUM ('PENDING', 'CONVERTED', 'ACTIVE', 'CHURNED');

-- CreateEnum
CREATE TYPE "CommissionType" AS ENUM ('FIRST_MONTH', 'RECURRING');

-- CreateEnum
CREATE TYPE "CommissionStatus" AS ENUM ('PENDING', 'APPROVED', 'PAID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "PayoutRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'PROCESSING', 'COMPLETED', 'REJECTED');

-- CreateEnum
CREATE TYPE "TrainerTier" AS ENUM ('MEMBER', 'PRO', 'ELITE', 'LEGEND');

-- AlterTable
ALTER TABLE "trainer_services" DROP COLUMN "currency",
ALTER COLUMN "price" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "duration" SET DEFAULT 60;

-- CreateTable
CREATE TABLE "ab_test_assignments" (
    "id" TEXT NOT NULL,
    "testName" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "variant" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ab_test_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ab_test_conversions" (
    "id" TEXT NOT NULL,
    "testName" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "variant" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "isTargetMetric" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "convertedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ab_test_conversions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ab_test_results" (
    "id" TEXT NOT NULL,
    "testName" TEXT NOT NULL,
    "variant" TEXT NOT NULL,
    "totalAssignments" INTEGER NOT NULL DEFAULT 0,
    "totalConversions" INTEGER NOT NULL DEFAULT 0,
    "conversionRate" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "lift" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "isWinner" BOOLEAN NOT NULL DEFAULT false,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ab_test_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ab_tests" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "versions" JSONB NOT NULL,
    "targetMetric" TEXT NOT NULL,
    "trafficSplit" INTEGER NOT NULL DEFAULT 50,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "winner" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ab_tests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_persona_earnings" (
    "id" TEXT NOT NULL,
    "personaId" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL DEFAULT 0.30,
    "sessionCount" INTEGER NOT NULL DEFAULT 1,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "payoutStatus" TEXT NOT NULL DEFAULT 'pending',
    "payoutId" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_persona_earnings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_persona_feedback" (
    "id" TEXT NOT NULL,
    "personaId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "sessionId" TEXT,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "isHelpful" BOOLEAN,
    "accuracyRating" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_persona_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_persona_sessions" (
    "id" TEXT NOT NULL,
    "personaId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "messageCount" INTEGER NOT NULL DEFAULT 0,
    "conversationData" JSONB,
    "cost" DECIMAL(65,30) NOT NULL DEFAULT 0.30,
    "trainerEarnings" DECIMAL(65,30) NOT NULL DEFAULT 0.30,
    "paymentStatus" TEXT NOT NULL DEFAULT 'pending',
    "stripePaymentId" TEXT,
    "paidAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_persona_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_personas" (
    "id" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tagline" TEXT,
    "bio" TEXT,
    "avatarUrl" TEXT,
    "voiceFileUrl" TEXT,
    "voiceSampleText" TEXT,
    "videoUrl" TEXT,
    "teachingStyle" TEXT NOT NULL DEFAULT 'motivational',
    "personality" JSONB NOT NULL,
    "specialties" TEXT[],
    "certifications" TEXT[],
    "pricePerSession" DECIMAL(65,30) NOT NULL DEFAULT 0.30,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "isDiscoverable" BOOLEAN NOT NULL DEFAULT true,
    "totalSessions" INTEGER NOT NULL DEFAULT 0,
    "totalEarnings" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "averageRating" DECIMAL(65,30) DEFAULT 0,
    "totalRatings" INTEGER NOT NULL DEFAULT 0,
    "elevenLabsVoiceId" TEXT,
    "elevenLabsModelUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "ai_personas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "metric" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "trainerId" TEXT NOT NULL,

    CONSTRAINT "analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "anonymous_sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "deviceId" TEXT,
    "deviceType" TEXT,
    "tempEmail" TEXT,
    "tempPhone" TEXT,
    "hasCompletedOnboarding" BOOLEAN NOT NULL DEFAULT false,
    "onboardingStep" INTEGER NOT NULL DEFAULT 0,
    "onboardingData" JSONB,
    "totalInteractions" INTEGER NOT NULL DEFAULT 0,
    "contentViewed" INTEGER NOT NULL DEFAULT 0,
    "timeSpent" INTEGER NOT NULL DEFAULT 0,
    "lastActiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "convertedToUserId" TEXT,
    "convertedAt" TIMESTAMP(3),
    "conversionTrigger" TEXT,
    "location" JSONB,
    "appVersion" TEXT,
    "referralSource" TEXT,
    "utmParams" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "anonymous_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_keys" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "authentication_gates" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT,
    "userId" TEXT,
    "gateType" TEXT NOT NULL,
    "gateTrigger" TEXT NOT NULL,
    "gateLocation" TEXT NOT NULL,
    "didAuthenticate" BOOLEAN NOT NULL DEFAULT false,
    "authenticatedAt" TIMESTAMP(3),
    "didConvert" BOOLEAN NOT NULL DEFAULT false,
    "contentType" TEXT,
    "contentId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "authentication_gates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "availability_windows" (
    "id" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "isRecurring" BOOLEAN NOT NULL DEFAULT true,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "maxSessions" INTEGER NOT NULL DEFAULT 8,
    "bufferMins" INTEGER NOT NULL DEFAULT 15,
    "isOverride" BOOLEAN NOT NULL DEFAULT false,
    "overrideDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "label" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "availability_windows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blocked_users" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "blockedUserId" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blocked_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_waitlist" (
    "id" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "desiredDate" TIMESTAMP(3),
    "desiredTimeSlot" TEXT,
    "sessionType" TEXT,
    "duration" INTEGER NOT NULL DEFAULT 60,
    "status" TEXT NOT NULL DEFAULT 'active',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "notifiedAt" TIMESTAMP(3),
    "bookedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "playerEmail" TEXT NOT NULL,
    "playerPhone" TEXT,
    "notifyViaSMS" BOOLEAN NOT NULL DEFAULT false,
    "notifyViaEmail" BOOLEAN NOT NULL DEFAULT true,
    "notifyViaPush" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "booking_waitlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "check_in_templates" (
    "id" TEXT NOT NULL DEFAULT (gen_random_uuid())::text,
    "trainer_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "questions" JSONB NOT NULL,
    "schedule" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "check_in_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "check_ins" (
    "id" TEXT NOT NULL DEFAULT (gen_random_uuid())::text,
    "template_id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "scheduled_for" TIMESTAMP(6) NOT NULL,
    "completed_at" TIMESTAMP(6),
    "responses" JSONB,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "check_ins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_health_scores" (
    "id" TEXT NOT NULL DEFAULT (gen_random_uuid())::text,
    "client_id" TEXT NOT NULL,
    "trainer_id" TEXT NOT NULL,
    "health_score" INTEGER NOT NULL,
    "attendance_rate" DECIMAL(5,2),
    "check_in_rate" DECIMAL(5,2),
    "response_time_hours" DECIMAL(10,2),
    "days_since_last_session" INTEGER,
    "churn_risk" TEXT,
    "last_calculated_at" TIMESTAMP(6) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "client_health_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_packages" (
    "id" TEXT NOT NULL DEFAULT (gen_random_uuid())::text,
    "client_id" TEXT NOT NULL,
    "package_id" TEXT NOT NULL,
    "sessions_total" INTEGER NOT NULL,
    "sessions_used" INTEGER NOT NULL DEFAULT 0,
    "purchased_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(6),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "stripe_subscription_id" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "client_packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "age" INTEGER,
    "goals" TEXT[],
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "trainerId" TEXT NOT NULL,
    "sport" TEXT,
    "skillLevel" TEXT,
    "injuries" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "preferences" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "progress" JSONB,
    "lastSessionDate" TIMESTAMP(3),
    "sessionsCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_features" (
    "id" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "workoutType" TEXT,
    "intensity" TEXT,
    "duration" INTEGER,
    "specialty" TEXT[],
    "equipment" TEXT[],
    "trainerId" TEXT,
    "trainerStyle" TEXT,
    "location" JSONB,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "bookingCount" INTEGER NOT NULL DEFAULT 0,
    "shareCount" INTEGER NOT NULL DEFAULT 0,
    "completionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "engagementScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "publishedAt" TIMESTAMP(3),
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tags" TEXT[],
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "currency_rates" (
    "id" TEXT NOT NULL,
    "fromCurrency" TEXT NOT NULL,
    "toCurrency" TEXT NOT NULL,
    "rate" DECIMAL(18,6) NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'api',
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "currency_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_logs" (
    "id" TEXT NOT NULL,
    "emailType" TEXT NOT NULL,
    "recipientEmail" TEXT NOT NULL,
    "subject" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentAt" TIMESTAMP(3),

    CONSTRAINT "email_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exercise_videos" (
    "id" TEXT NOT NULL DEFAULT (gen_random_uuid())::text,
    "trainer_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "video_url" TEXT NOT NULL,
    "thumbnail_url" TEXT,
    "duration" INTEGER,
    "category" TEXT,
    "tags" TEXT[],
    "specialty" TEXT,
    "difficulty" TEXT,
    "equipment" TEXT[],
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exercise_videos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exercises" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "muscleGroups" TEXT[],
    "equipment" TEXT[],
    "difficulty" TEXT NOT NULL,
    "instructions" TEXT NOT NULL,
    "tips" TEXT,
    "videoUrl" TEXT,
    "imageUrl" TEXT,
    "caloriesPerMinute" DOUBLE PRECISION,
    "popularityScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "variations" JSONB,
    "contraindications" TEXT[],
    "substitutes" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facilities" (
    "id" TEXT NOT NULL DEFAULT (gen_random_uuid())::text,
    "name" TEXT NOT NULL,
    "sport" TEXT NOT NULL,
    "type" TEXT,
    "category" TEXT NOT NULL DEFAULT 'rec',
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "postal_code" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "email" TEXT,
    "description" TEXT,
    "amenities" JSONB DEFAULT '[]',
    "surface_type" TEXT,
    "court_count" INTEGER,
    "indoor" BOOLEAN DEFAULT false,
    "is_public" BOOLEAN DEFAULT true,
    "hours" JSONB,
    "rating" DOUBLE PRECISION,
    "review_count" INTEGER DEFAULT 0,
    "source" TEXT NOT NULL,
    "source_id" TEXT NOT NULL,
    "source_url" TEXT,
    "metadata" JSONB DEFAULT '{}',
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "geo_point" geography,

    CONSTRAINT "facilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facility_data_quality" (
    "id" TEXT NOT NULL,
    "facility_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "total_checkins" INTEGER DEFAULT 0,
    "verified_checkins" INTEGER DEFAULT 0,
    "avg_confidence" DECIMAL(3,2) DEFAULT 0.00,
    "avg_gps_accuracy" DECIMAL(10,2),
    "overall_quality" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "facility_data_quality_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facility_reports" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "facilityId" TEXT NOT NULL,
    "sport" TEXT NOT NULL,
    "specificLocation" TEXT,
    "crowdLevel" TEXT,
    "skillLevel" TEXT,
    "ageGroup" TEXT,
    "weatherCondition" TEXT,
    "surfaceCondition" TEXT,
    "waitTime" INTEGER,
    "parkingAvailability" TEXT,
    "notes" TEXT,
    "photos" TEXT[],
    "videos" TEXT[],
    "helpfulVotes" INTEGER NOT NULL DEFAULT 0,
    "notHelpfulVotes" INTEGER NOT NULL DEFAULT 0,
    "confirmations" INTEGER NOT NULL DEFAULT 0,
    "rewardAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "bonusAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "streakMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "reportQuality" INTEGER,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "gpsLat" DOUBLE PRECISION,
    "gpsLng" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "gps_accuracy" DECIMAL(10,2),
    "device_type" TEXT,
    "app_version" TEXT,
    "is_verified" BOOLEAN DEFAULT false,
    "confidence_score" DECIMAL(3,2) DEFAULT 0.50,
    "quality_warnings" JSONB DEFAULT '[]',
    "distance_from_facility" DECIMAL(10,2),

    CONSTRAINT "facility_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facility_sport_mappings" (
    "id" SERIAL NOT NULL,
    "sport" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "osm_tags" JSONB,
    "google_types" JSONB,
    "category" TEXT NOT NULL DEFAULT 'rec',
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "facility_sport_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feed_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "duration" INTEGER,
    "contentServed" INTEGER NOT NULL DEFAULT 0,
    "contentViewed" INTEGER NOT NULL DEFAULT 0,
    "contentLiked" INTEGER NOT NULL DEFAULT 0,
    "contentSkipped" INTEGER NOT NULL DEFAULT 0,
    "contentBooked" INTEGER NOT NULL DEFAULT 0,
    "algorithmVersion" TEXT NOT NULL DEFAULT 'v1',
    "avgTimePerItem" DOUBLE PRECISION,
    "skipRate" DOUBLE PRECISION,
    "engagementRate" DOUBLE PRECISION,
    "deviceType" TEXT,
    "appVersion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feed_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gia_content" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "generatedContent" JSONB NOT NULL,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gia_content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_class_bookings" (
    "id" TEXT NOT NULL DEFAULT (gen_random_uuid())::text,
    "class_id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'confirmed',
    "booked_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cancelled_at" TIMESTAMP(6),
    "attended_at" TIMESTAMP(6),
    "payment_id" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "group_class_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_classes" (
    "id" TEXT NOT NULL DEFAULT (gen_random_uuid())::text,
    "trainer_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "max_capacity" INTEGER NOT NULL,
    "current_bookings" INTEGER NOT NULL DEFAULT 0,
    "price_per_person" DECIMAL(10,2) NOT NULL,
    "scheduled_at" TIMESTAMP(6) NOT NULL,
    "duration" INTEGER NOT NULL,
    "location" TEXT,
    "is_recurring" BOOLEAN NOT NULL DEFAULT false,
    "recurring_pattern" TEXT,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "group_classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leaderboard_snapshots" (
    "id" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "periodStart" DATE NOT NULL,
    "periodEnd" DATE,
    "rankings" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "leaderboard_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_categories" (
    "id" TEXT NOT NULL,
    "sport" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "commonIssues" TEXT[],
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "maintenance_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_reports" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "facilityId" TEXT NOT NULL,
    "sport" TEXT NOT NULL,
    "specificLocation" TEXT,
    "category" TEXT NOT NULL,
    "issue" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "description" TEXT,
    "photos" TEXT[],
    "videos" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'reported',
    "acknowledgedAt" TIMESTAMP(3),
    "inProgressAt" TIMESTAMP(3),
    "fixedAt" TIMESTAMP(3),
    "verifiedAt" TIMESTAMP(3),
    "confirmations" INTEGER NOT NULL DEFAULT 0,
    "helpfulVotes" INTEGER NOT NULL DEFAULT 0,
    "rewardAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "bonusAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "facilityNotes" TEXT,
    "estimatedFixDate" TIMESTAMP(3),
    "actualCost" DOUBLE PRECISION,
    "fixDuration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "maintenance_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "messageType" "MessageType" NOT NULL DEFAULT 'TEXT',
    "read" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "sessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "moderation_actions" (
    "id" TEXT NOT NULL,
    "moderatorId" TEXT NOT NULL,
    "moderatorName" TEXT NOT NULL,
    "actionType" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "notes" TEXT,
    "metadata" JSONB,
    "isAutomated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "moderation_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_preferences" (
    "id" TEXT NOT NULL DEFAULT (gen_random_uuid())::text,
    "userId" TEXT NOT NULL,
    "bookingConfirmedEnabled" BOOLEAN NOT NULL DEFAULT true,
    "bookingReminderEnabled" BOOLEAN NOT NULL DEFAULT true,
    "bookingCancelledEnabled" BOOLEAN NOT NULL DEFAULT true,
    "bookingRescheduledEnabled" BOOLEAN NOT NULL DEFAULT true,
    "sessionCompletedEnabled" BOOLEAN NOT NULL DEFAULT true,
    "messageReceivedEnabled" BOOLEAN NOT NULL DEFAULT true,
    "workoutPlanReadyEnabled" BOOLEAN NOT NULL DEFAULT true,
    "paymentReceivedEnabled" BOOLEAN NOT NULL DEFAULT true,
    "paymentDueEnabled" BOOLEAN NOT NULL DEFAULT true,
    "trainerNoteEnabled" BOOLEAN NOT NULL DEFAULT true,
    "promoOfferEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "onboarding_preferences" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "fitnessGoals" TEXT[],
    "experience" TEXT,
    "workoutTypes" TEXT[],
    "availability" TEXT[],
    "location" JSONB,
    "maxDistance" DOUBLE PRECISION,
    "budgetRange" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "onboarding_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "packages" (
    "id" TEXT NOT NULL DEFAULT (gen_random_uuid())::text,
    "trainer_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sessions" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "validity_days" INTEGER NOT NULL DEFAULT 90,
    "is_recurring" BOOLEAN NOT NULL DEFAULT false,
    "recurring_interval" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_intents" (
    "id" TEXT NOT NULL,
    "stripeIntentId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,
    "sessionId" TEXT,
    "metadata" JSONB,
    "clientSecret" TEXT NOT NULL,
    "paymentMethodId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_intents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "method" "PaymentMethod" NOT NULL,
    "description" TEXT,
    "paidAt" TIMESTAMP(3),
    "stripePaymentId" TEXT,
    "stripeChargeId" TEXT,
    "stripeFee" DOUBLE PRECISION,
    "platformFee" DOUBLE PRECISION,
    "trainerPayout" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "trainerId" TEXT NOT NULL,
    "clientId" TEXT,
    "appClientId" TEXT,
    "sessionId" TEXT,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phone_numbers" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "nationalNumber" TEXT NOT NULL,
    "fullNumber" TEXT NOT NULL,
    "formattedLocal" TEXT,
    "formattedIntl" TEXT,
    "isValid" BOOLEAN NOT NULL DEFAULT false,
    "isPossible" BOOLEAN NOT NULL DEFAULT false,
    "numberType" TEXT,
    "carrier" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "verificationMethod" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "phone_numbers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_adjustments" (
    "id" TEXT NOT NULL,
    "workoutPlanId" TEXT NOT NULL,
    "adjustmentType" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "trigger" TEXT NOT NULL,
    "before" JSONB NOT NULL,
    "after" JSONB NOT NULL,
    "madeBy" TEXT NOT NULL DEFAULT 'ai',
    "aiModel" TEXT,
    "wasSuccessful" BOOLEAN,
    "clientFeedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plan_adjustments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "premium_subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'PREMIUM',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "stripeSubscriptionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "premium_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "premium_trials" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "premium_trials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "realtime_updates" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "data" JSONB NOT NULL DEFAULT '{}',
    "read" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "read_at" TIMESTAMPTZ(6),

    CONSTRAINT "realtime_updates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recommendation_scores" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "personalScore" DOUBLE PRECISION NOT NULL,
    "popularityScore" DOUBLE PRECISION NOT NULL,
    "recencyScore" DOUBLE PRECISION NOT NULL,
    "diversityScore" DOUBLE PRECISION NOT NULL,
    "finalScore" DOUBLE PRECISION NOT NULL,
    "rank" INTEGER,
    "algorithmVersion" TEXT NOT NULL DEFAULT 'v1',
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "reasoning" JSONB,

    CONSTRAINT "recommendation_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referral_tracking" (
    "id" TEXT NOT NULL,
    "referrerId" TEXT,
    "referredEmail" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "referralCode" TEXT NOT NULL,
    "converted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "referral_tracking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refunds" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "stripeRefundId" TEXT,
    "initiatedBy" TEXT NOT NULL,
    "initiatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "failureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "refunds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "regional_availability" (
    "id" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "availableIn" TEXT[],
    "blockedIn" TEXT[],
    "requiresGDPR" BOOLEAN NOT NULL DEFAULT false,
    "requiresCCPA" BOOLEAN NOT NULL DEFAULT false,
    "requiresLGPD" BOOLEAN NOT NULL DEFAULT false,
    "ageRestriction" INTEGER,
    "blockReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "regional_availability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_confirmations" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "reportType" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "confirmationType" TEXT NOT NULL,
    "notes" TEXT,
    "photo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "report_confirmations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reporter_badges" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "requirement" JSONB NOT NULL,
    "rarity" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reporter_badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reporter_challenges" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "requirement" JSONB NOT NULL,
    "cashReward" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "creditReward" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "badgeReward" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reporter_challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "reporterEmail" TEXT,
    "contentType" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "reportedUserId" TEXT,
    "reason" TEXT NOT NULL,
    "category" TEXT,
    "description" TEXT,
    "evidence" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'pending',
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "resolution" TEXT,
    "resolutionNotes" TEXT,
    "actionTaken" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rescheduling_attempts" (
    "id" TEXT NOT NULL,
    "conflictId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "attemptNumber" INTEGER NOT NULL,
    "strategy" TEXT NOT NULL,
    "proposedTime" TIMESTAMP(3) NOT NULL,
    "aiConfidence" DOUBLE PRECISION,
    "reasoning" TEXT,
    "alternativeSlots" JSONB,
    "sentToClient" BOOLEAN NOT NULL DEFAULT false,
    "sentAt" TIMESTAMP(3),
    "viewedByClient" BOOLEAN NOT NULL DEFAULT false,
    "viewedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'pending',
    "respondedAt" TIMESTAMP(3),
    "declineReason" TEXT,
    "responseTime" INTEGER,
    "wasSuccessful" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rescheduling_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rescheduling_metrics" (
    "id" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "totalConflicts" INTEGER NOT NULL DEFAULT 0,
    "autoResolved" INTEGER NOT NULL DEFAULT 0,
    "manualResolved" INTEGER NOT NULL DEFAULT 0,
    "unresolved" INTEGER NOT NULL DEFAULT 0,
    "autoResolveRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "clientAcceptRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgResponseTime" INTEGER,
    "avgAttempts" DOUBLE PRECISION,
    "hoursAutoSaved" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "manualHoursSpent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgClientRating" DOUBLE PRECISION,
    "complaintsReceived" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rescheduling_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rescheduling_rules" (
    "id" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,
    "ruleName" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "conflictTypes" TEXT[],
    "minNoticePeriod" INTEGER,
    "autoReschedule" BOOLEAN NOT NULL DEFAULT true,
    "autoNotifyClient" BOOLEAN NOT NULL DEFAULT true,
    "requireApproval" BOOLEAN NOT NULL DEFAULT false,
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "preferredDays" INTEGER[],
    "preferredTimes" JSONB NOT NULL,
    "bufferMinutes" INTEGER NOT NULL DEFAULT 30,
    "maxDaysOut" INTEGER NOT NULL DEFAULT 14,
    "respectClientPrefs" BOOLEAN NOT NULL DEFAULT true,
    "allowWeekends" BOOLEAN NOT NULL DEFAULT false,
    "allowEvenings" BOOLEAN NOT NULL DEFAULT true,
    "addToWaitlist" BOOLEAN NOT NULL DEFAULT true,
    "offerVirtualOption" BOOLEAN NOT NULL DEFAULT false,
    "suggestOtherTrainer" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rescheduling_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "retention_alerts" (
    "id" TEXT NOT NULL DEFAULT (gen_random_uuid())::text,
    "trainer_id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "alert_type" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "action_suggested" TEXT,
    "is_dismissed" BOOLEAN NOT NULL DEFAULT false,
    "dismissed_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "retention_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "trainerId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "sessionId" TEXT,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scheduling_conflicts" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "originalTime" TIMESTAMP(3) NOT NULL,
    "conflictType" TEXT NOT NULL,
    "conflictSource" TEXT,
    "severity" TEXT NOT NULL DEFAULT 'medium',
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "detectedBy" TEXT NOT NULL DEFAULT 'system',
    "conflictReason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "resolutionType" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "resolutionNotes" TEXT,
    "suggestedSlots" JSONB,
    "aiRecommendation" TEXT,
    "newSessionId" TEXT,
    "newTime" TIMESTAMP(3),
    "acceptedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scheduling_conflicts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scraper_jobs" (
    "id" TEXT NOT NULL,
    "job_type" TEXT NOT NULL,
    "sport" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "total_found" INTEGER DEFAULT 0,
    "total_imported" INTEGER DEFAULT 0,
    "total_skipped" INTEGER DEFAULT 0,
    "total_failed" INTEGER DEFAULT 0,
    "error_message" TEXT,
    "started_at" TIMESTAMPTZ(6),
    "completed_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scraper_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scraper_logs" (
    "id" SERIAL NOT NULL,
    "job_id" TEXT,
    "level" TEXT NOT NULL DEFAULT 'info',
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scraper_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stripe_accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stripeAccountId" TEXT NOT NULL,
    "accountType" TEXT NOT NULL DEFAULT 'express',
    "detailsSubmitted" BOOLEAN NOT NULL DEFAULT false,
    "chargesEnabled" BOOLEAN NOT NULL DEFAULT false,
    "payoutsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "currentlyDue" TEXT[],
    "eventuallyDue" TEXT[],
    "pastDue" TEXT[],
    "pendingVerification" TEXT[],
    "email" TEXT,
    "country" TEXT,
    "defaultCurrency" TEXT,
    "payoutSchedule" JSONB,
    "businessName" TEXT,
    "businessUrl" TEXT,
    "supportPhone" TEXT,
    "supportEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stripe_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_history" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "fromPlanId" TEXT,
    "fromPlanName" TEXT,
    "toPlanId" TEXT,
    "toPlanName" TEXT,
    "stripeEventId" TEXT,
    "stripeSubscriptionId" TEXT,
    "amount" DOUBLE PRECISION,
    "currency" TEXT,
    "billingCycle" TEXT,
    "reason" TEXT,
    "notes" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscription_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_plans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "priceMonthly" DOUBLE PRECISION NOT NULL,
    "priceYearly" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "stripePriceIdMonthly" TEXT,
    "stripePriceIdYearly" TEXT,
    "features" JSONB NOT NULL,
    "giaQueriesPerDay" INTEGER NOT NULL DEFAULT -1,
    "aiPersonasPerDay" INTEGER NOT NULL DEFAULT -1,
    "aiWorkoutPlansPerMonth" INTEGER NOT NULL DEFAULT 0,
    "bookingDiscountPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "trialDays" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_usage" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "featureType" TEXT NOT NULL,
    "featureId" TEXT,
    "metadata" JSONB,
    "usedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscription_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supported_regions" (
    "id" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "countryName" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "isSupported" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "launchDate" TIMESTAMP(3),
    "languages" TEXT[],
    "defaultLanguage" TEXT NOT NULL,
    "defaultCurrency" TEXT NOT NULL,
    "defaultTimezone" TEXT NOT NULL,
    "bookingEnabled" BOOLEAN NOT NULL DEFAULT true,
    "paymentsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "aiPersonaEnabled" BOOLEAN NOT NULL DEFAULT true,
    "paymentMethods" TEXT[],
    "flagEmoji" TEXT NOT NULL,
    "phonePrefix" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "supported_regions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trainer_pricing" (
    "id" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,
    "baseCurrency" TEXT NOT NULL DEFAULT 'USD',
    "basePrice" DECIMAL(10,2) NOT NULL,
    "altCurrency1" TEXT,
    "altPrice1" DECIMAL(10,2),
    "altCurrency2" TEXT,
    "altPrice2" DECIMAL(10,2),
    "autoConvert" BOOLEAN NOT NULL DEFAULT true,
    "roundPrices" BOOLEAN NOT NULL DEFAULT true,
    "sessionType" TEXT NOT NULL DEFAULT 'standard',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trainer_pricing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trainer_sessions" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "SessionType" NOT NULL,
    "duration" INTEGER NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "status" "SessionStatus" NOT NULL DEFAULT 'SCHEDULED',
    "notes" TEXT,
    "bookedFrom" "BookingSource" NOT NULL DEFAULT 'DASHBOARD',
    "location" TEXT,
    "meetingLink" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "trainerId" TEXT NOT NULL,
    "clientId" TEXT,
    "appClientId" TEXT,

    CONSTRAINT "trainer_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trainer_verifications" (
    "id" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,
    "trainerEmail" TEXT NOT NULL,
    "verificationType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "documentType" TEXT,
    "documentUrl" TEXT,
    "documentNumber" TEXT,
    "expiresAt" TIMESTAMP(3),
    "verifiedBy" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trainer_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trainers" (
    "id" TEXT NOT NULL DEFAULT (gen_random_uuid())::text,
    "user_id" TEXT NOT NULL,
    "years_experience" TEXT,
    "certifications" TEXT[],
    "session_types" TEXT[],
    "pricing" JSONB,
    "availability" TEXT[],
    "current_clients" TEXT,
    "desired_clients" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trainers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "translations" (
    "id" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "fieldName" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "originalText" TEXT NOT NULL,
    "translatedText" TEXT NOT NULL,
    "translatedBy" TEXT NOT NULL DEFAULT 'auto',
    "translationService" TEXT,
    "confidence" DOUBLE PRECISION DEFAULT 1.0,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "needsReview" BOOLEAN NOT NULL DEFAULT false,
    "translatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verifiedAt" TIMESTAMP(3),
    "verifiedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_badges" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "progress" JSONB,

    CONSTRAINT "user_badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_bans" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "banType" TEXT NOT NULL,
    "duration" INTEGER,
    "expiresAt" TIMESTAMP(3),
    "bannedBy" TEXT NOT NULL,
    "bannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "liftedAt" TIMESTAMP(3),
    "liftedBy" TEXT,
    "liftReason" TEXT,
    "relatedReportId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_bans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_challenges" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "progress" JSONB NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "claimed" BOOLEAN NOT NULL DEFAULT false,
    "claimedAt" TIMESTAMP(3),

    CONSTRAINT "user_challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_interactions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "actionValue" DOUBLE PRECISION,
    "sessionId" TEXT,
    "deviceType" TEXT,
    "location" JSONB,
    "timeOfDay" TEXT,
    "dayOfWeek" INTEGER,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_interactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_locales" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "country" TEXT NOT NULL DEFAULT 'US',
    "locale" TEXT NOT NULL DEFAULT 'en-US',
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "timezone" TEXT NOT NULL DEFAULT 'America/New_York',
    "distanceUnit" TEXT NOT NULL DEFAULT 'miles',
    "weightUnit" TEXT NOT NULL DEFAULT 'lbs',
    "temperatureUnit" TEXT NOT NULL DEFAULT 'fahrenheit',
    "dateFormat" TEXT NOT NULL DEFAULT 'MM/DD/YYYY',
    "timeFormat" TEXT NOT NULL DEFAULT '12h',
    "firstDayOfWeek" INTEGER NOT NULL DEFAULT 0,
    "showLocalFirst" BOOLEAN NOT NULL DEFAULT true,
    "autoTranslate" BOOLEAN NOT NULL DEFAULT false,
    "detectedCountry" TEXT,
    "detectedTimezone" TEXT,
    "detectedLanguage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_locales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "workoutTypes" JSONB NOT NULL,
    "intensityLevel" TEXT NOT NULL DEFAULT 'medium',
    "trainerStyles" JSONB NOT NULL,
    "trainerIds" TEXT[],
    "videoLength" TEXT NOT NULL DEFAULT 'medium',
    "contentFormats" JSONB NOT NULL,
    "specialties" JSONB NOT NULL,
    "preferredTimes" TEXT[],
    "preferredDays" INTEGER[],
    "maxDistance" DOUBLE PRECISION,
    "preferredAreas" TEXT[],
    "engagementScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "skipRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "bookingRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "modelVersion" TEXT NOT NULL DEFAULT 'v1',
    "lastComputed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalInteractions" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_reporter_stats" (
    "userId" TEXT NOT NULL,
    "totalReports" INTEGER NOT NULL DEFAULT 0,
    "facilityReports" INTEGER NOT NULL DEFAULT 0,
    "maintenanceReports" INTEGER NOT NULL DEFAULT 0,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastReportDate" DATE,
    "totalEarned" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalBonuses" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "pendingCredits" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "averageQuality" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "helpfulVotesReceived" INTEGER NOT NULL DEFAULT 0,
    "confirmationsReceived" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "weeklyRank" INTEGER,
    "monthlyRank" INTEGER,
    "allTimeRank" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_reporter_stats_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "user_reputation" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "total_checkins" INTEGER DEFAULT 0,
    "verified_checkins" INTEGER DEFAULT 0,
    "reported_issues" INTEGER DEFAULT 0,
    "badges_earned" INTEGER DEFAULT 0,
    "reputation_score" DECIMAL(3,2) DEFAULT 0.50,
    "reputation_tier" TEXT DEFAULT 'low',
    "first_checkin_at" TIMESTAMPTZ(6),
    "last_checkin_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_reputation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "planName" TEXT NOT NULL,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "stripePriceId" TEXT,
    "status" TEXT NOT NULL,
    "billingCycle" TEXT NOT NULL,
    "currentPeriodStart" TIMESTAMP(3) NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "trialStart" TIMESTAMP(3),
    "trialEnd" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "canceledAt" TIMESTAMP(3),
    "cancelReason" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "password" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'CLIENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "bio" TEXT,
    "specialties" TEXT[],
    "certifications" TEXT[],
    "hourlyRate" DOUBLE PRECISION,
    "phone" TEXT,
    "location" TEXT,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "rating" DOUBLE PRECISION,
    "totalSessions" INTEGER NOT NULL DEFAULT 0,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "locationEnabled" BOOLEAN NOT NULL DEFAULT false,
    "locationUpdatedAt" TIMESTAMP(3),
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT DEFAULT 'US',
    "postalCode" TEXT,
    "user_type" TEXT,
    "activities" TEXT[],
    "experience_level" TEXT,
    "age_range" TEXT,
    "years_experience" TEXT,
    "primary_goal" TEXT,
    "secondary_goal" TEXT,
    "business_type" TEXT,
    "client_count" TEXT,
    "timezone" TEXT,
    "frequency" TEXT,
    "budget" TEXT,
    "preferred_time" TEXT,
    "zip_code" TEXT,
    "onboarding_complete" BOOLEAN DEFAULT false,
    "onboarding_completed_at" TIMESTAMPTZ(6),
    "fcmTokens" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "clerkId" TEXT,
    "google_access_token" TEXT,
    "google_refresh_token" TEXT,
    "google_token_expires_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "video_shares" (
    "id" TEXT NOT NULL DEFAULT (gen_random_uuid())::text,
    "video_id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "shared_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "viewed_at" TIMESTAMP(6),
    "view_count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "video_shares_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "viral_content" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "contentData" JSONB NOT NULL,
    "shareCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "viral_content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "viral_metrics" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "metricType" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "contentId" TEXT,
    "referralCode" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "viral_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "waitlist_entries" (
    "id" TEXT NOT NULL DEFAULT (gen_random_uuid())::text,
    "session_id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "added_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notified_at" TIMESTAMP(6),
    "claimed_at" TIMESTAMP(6),
    "expired_at" TIMESTAMP(6),
    "status" TEXT NOT NULL DEFAULT 'waiting',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "waitlist_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "waitlist_notifications" (
    "id" TEXT NOT NULL,
    "waitlistId" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "notificationType" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "opened" BOOLEAN NOT NULL DEFAULT false,
    "openedAt" TIMESTAMP(3),
    "availableDate" TIMESTAMP(3),
    "availableSlot" TEXT,
    "responded" BOOLEAN NOT NULL DEFAULT false,
    "respondedAt" TIMESTAMP(3),
    "booked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "waitlist_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workout_plans" (
    "id" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "goal" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "difficulty" TEXT NOT NULL,
    "clientGoals" JSONB NOT NULL,
    "fitnessLevel" TEXT NOT NULL,
    "availableTime" INTEGER NOT NULL,
    "sessionsPerWeek" INTEGER NOT NULL,
    "equipment" TEXT[],
    "injuries" TEXT[],
    "preferences" JSONB,
    "generatedBy" TEXT NOT NULL DEFAULT 'ai',
    "aiModel" TEXT,
    "generationPrompt" TEXT,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "isTemplate" BOOLEAN NOT NULL DEFAULT false,
    "currentWeek" INTEGER NOT NULL DEFAULT 1,
    "completedSessions" INTEGER NOT NULL DEFAULT 0,
    "totalSessions" INTEGER NOT NULL,
    "completionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "adherenceScore" DOUBLE PRECISION,
    "progressScore" DOUBLE PRECISION,
    "lastAdjusted" TIMESTAMP(3),
    "autoAdjust" BOOLEAN NOT NULL DEFAULT true,
    "adjustmentReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workout_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workout_progress" (
    "id" TEXT NOT NULL,
    "workoutPlanId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "week" INTEGER NOT NULL,
    "weight" DOUBLE PRECISION,
    "bodyFat" DOUBLE PRECISION,
    "muscleMass" DOUBLE PRECISION,
    "measurements" JSONB,
    "strength" JSONB,
    "endurance" JSONB,
    "flexibility" JSONB,
    "energyLevel" INTEGER,
    "motivation" INTEGER,
    "soreness" INTEGER,
    "notes" TEXT,
    "progressPhotos" TEXT[],
    "aiInsights" TEXT,
    "recommendations" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workout_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workout_sessions" (
    "id" TEXT NOT NULL,
    "workoutPlanId" TEXT NOT NULL,
    "week" INTEGER NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "sessionNumber" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "estimatedDuration" INTEGER NOT NULL,
    "scheduledFor" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "exercises" JSONB NOT NULL,
    "warmup" JSONB,
    "cooldown" JSONB,
    "clientRating" INTEGER,
    "difficultyRating" INTEGER,
    "clientNotes" TEXT,
    "trainerNotes" TEXT,
    "actualDuration" INTEGER,
    "caloriesBurned" INTEGER,
    "heartRateAvg" INTEGER,
    "needsAdjustment" BOOLEAN NOT NULL DEFAULT false,
    "adjustmentFlag" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workout_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gia_programs" (
    "id" TEXT NOT NULL,
    "instructorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "sportCategory" TEXT,
    "difficultyLevel" TEXT,
    "durationMinutes" INTEGER,
    "content" JSONB NOT NULL,
    "giaPrompt" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "timesUsed" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "gia_programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gia_program_usage" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "instructorId" TEXT NOT NULL,
    "studentId" TEXT,
    "usedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "feedback" TEXT,
    "rating" INTEGER,

    CONSTRAINT "gia_program_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ambassadors" (
    "id" TEXT NOT NULL DEFAULT (gen_random_uuid())::text,
    "userId" TEXT,
    "email" TEXT,
    "name" TEXT,
    "referralCode" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "totalEarnings" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "pendingEarnings" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "paidEarnings" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalReferrals" INTEGER NOT NULL DEFAULT 0,
    "activeReferrals" INTEGER NOT NULL DEFAULT 0,
    "payoutMethod" TEXT DEFAULT 'STRIPE',
    "payoutEmail" TEXT,
    "bankAccountLast4" TEXT,
    "stripeAccountId" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "locale" TEXT NOT NULL DEFAULT 'en',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ambassadors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referrals" (
    "id" TEXT NOT NULL DEFAULT (gen_random_uuid())::text,
    "ambassadorId" TEXT NOT NULL,
    "referredUserId" TEXT NOT NULL,
    "referralCode" TEXT NOT NULL,
    "status" "ReferralStatus" NOT NULL DEFAULT 'PENDING',
    "convertedAt" TIMESTAMP(3),
    "firstPaymentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "referrals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commissions" (
    "id" TEXT NOT NULL DEFAULT (gen_random_uuid())::text,
    "ambassadorId" TEXT NOT NULL,
    "referralId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "type" "CommissionType" NOT NULL,
    "status" "CommissionStatus" NOT NULL DEFAULT 'PENDING',
    "paymentId" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "commissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payouts" (
    "id" TEXT NOT NULL DEFAULT (gen_random_uuid())::text,
    "ambassadorId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "method" TEXT,
    "transactionId" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payout_requests" (
    "id" TEXT NOT NULL DEFAULT (gen_random_uuid())::text,
    "ambassadorId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "PayoutRequestStatus" NOT NULL DEFAULT 'PENDING',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "processedBy" TEXT,
    "payoutEmail" TEXT NOT NULL,
    "payoutMethod" TEXT NOT NULL DEFAULT 'STRIPE',
    "stripeTransferId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payout_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ambassador_magic_links" (
    "id" TEXT NOT NULL DEFAULT (gen_random_uuid())::text,
    "ambassadorId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ambassador_magic_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ambassador_sessions" (
    "id" TEXT NOT NULL DEFAULT (gen_random_uuid())::text,
    "ambassadorId" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ambassador_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trainer_profiles" (
    "id" TEXT NOT NULL DEFAULT (gen_random_uuid())::text,
    "userId" TEXT NOT NULL,
    "bio" TEXT,
    "specialties" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "certifications" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "yearsExperience" INTEGER,
    "instagramHandle" TEXT,
    "tiktokHandle" TEXT,
    "youtubeChannel" TEXT,
    "websiteUrl" TEXT,
    "tier" "TrainerTier" NOT NULL DEFAULT 'MEMBER',
    "badges" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "profilePhotoUrl" TEXT,
    "coverPhotoUrl" TEXT,
    "location" TEXT,
    "hourlyRate" DOUBLE PRECISION,
    "monthlyRevenue" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalClients" INTEGER NOT NULL DEFAULT 0,
    "activeClients" INTEGER NOT NULL DEFAULT 0,
    "averageRating" DOUBLE PRECISION,
    "totalReviews" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trainer_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "success_stories" (
    "id" TEXT NOT NULL DEFAULT (gen_random_uuid())::text,
    "trainerId" TEXT NOT NULL,
    "trainerProfileId" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "beforePhotoUrl" TEXT,
    "afterPhotoUrl" TEXT,
    "beforeVideoUrl" TEXT,
    "afterVideoUrl" TEXT,
    "testimonial" TEXT NOT NULL,
    "metrics" JSONB,
    "timeframe" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "success_stories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_posts" (
    "id" TEXT NOT NULL DEFAULT (gen_random_uuid())::text,
    "trainerId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "mediaUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "likes" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "views" INTEGER NOT NULL DEFAULT 0,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "community_posts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ab_test_assignments_testName_idx" ON "ab_test_assignments"("testName");

-- CreateIndex
CREATE INDEX "ab_test_assignments_userId_idx" ON "ab_test_assignments"("userId");

-- CreateIndex
CREATE INDEX "ab_test_assignments_variant_idx" ON "ab_test_assignments"("variant");

-- CreateIndex
CREATE UNIQUE INDEX "ab_test_assignments_testName_userId_key" ON "ab_test_assignments"("testName", "userId");

-- CreateIndex
CREATE INDEX "ab_test_conversions_action_idx" ON "ab_test_conversions"("action");

-- CreateIndex
CREATE INDEX "ab_test_conversions_isTargetMetric_idx" ON "ab_test_conversions"("isTargetMetric");

-- CreateIndex
CREATE INDEX "ab_test_conversions_testName_idx" ON "ab_test_conversions"("testName");

-- CreateIndex
CREATE INDEX "ab_test_conversions_userId_idx" ON "ab_test_conversions"("userId");

-- CreateIndex
CREATE INDEX "ab_test_conversions_variant_idx" ON "ab_test_conversions"("variant");

-- CreateIndex
CREATE INDEX "ab_test_results_testName_idx" ON "ab_test_results"("testName");

-- CreateIndex
CREATE INDEX "ab_test_results_variant_idx" ON "ab_test_results"("variant");

-- CreateIndex
CREATE UNIQUE INDEX "ab_test_results_testName_variant_key" ON "ab_test_results"("testName", "variant");

-- CreateIndex
CREATE UNIQUE INDEX "ab_tests_name_key" ON "ab_tests"("name");

-- CreateIndex
CREATE INDEX "ab_tests_name_idx" ON "ab_tests"("name");

-- CreateIndex
CREATE INDEX "ab_tests_status_idx" ON "ab_tests"("status");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE INDEX "ai_persona_earnings_date_idx" ON "ai_persona_earnings"("date");

-- CreateIndex
CREATE INDEX "ai_persona_earnings_payoutStatus_idx" ON "ai_persona_earnings"("payoutStatus");

-- CreateIndex
CREATE INDEX "ai_persona_earnings_personaId_idx" ON "ai_persona_earnings"("personaId");

-- CreateIndex
CREATE INDEX "ai_persona_earnings_trainerId_idx" ON "ai_persona_earnings"("trainerId");

-- CreateIndex
CREATE INDEX "ai_persona_feedback_personaId_idx" ON "ai_persona_feedback"("personaId");

-- CreateIndex
CREATE INDEX "ai_persona_feedback_playerId_idx" ON "ai_persona_feedback"("playerId");

-- CreateIndex
CREATE INDEX "ai_persona_feedback_rating_idx" ON "ai_persona_feedback"("rating");

-- CreateIndex
CREATE INDEX "ai_persona_sessions_paymentStatus_idx" ON "ai_persona_sessions"("paymentStatus");

-- CreateIndex
CREATE INDEX "ai_persona_sessions_personaId_idx" ON "ai_persona_sessions"("personaId");

-- CreateIndex
CREATE INDEX "ai_persona_sessions_playerId_idx" ON "ai_persona_sessions"("playerId");

-- CreateIndex
CREATE INDEX "ai_persona_sessions_startedAt_idx" ON "ai_persona_sessions"("startedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ai_personas_trainerId_key" ON "ai_personas"("trainerId");

-- CreateIndex
CREATE INDEX "ai_personas_isActive_idx" ON "ai_personas"("isActive");

-- CreateIndex
CREATE INDEX "ai_personas_isDiscoverable_idx" ON "ai_personas"("isDiscoverable");

-- CreateIndex
CREATE INDEX "ai_personas_trainerId_idx" ON "ai_personas"("trainerId");

-- CreateIndex
CREATE UNIQUE INDEX "anonymous_sessions_sessionToken_key" ON "anonymous_sessions"("sessionToken");

-- CreateIndex
CREATE INDEX "anonymous_sessions_convertedToUserId_idx" ON "anonymous_sessions"("convertedToUserId");

-- CreateIndex
CREATE INDEX "anonymous_sessions_deviceId_idx" ON "anonymous_sessions"("deviceId");

-- CreateIndex
CREATE INDEX "anonymous_sessions_expiresAt_idx" ON "anonymous_sessions"("expiresAt");

-- CreateIndex
CREATE INDEX "anonymous_sessions_lastActiveAt_idx" ON "anonymous_sessions"("lastActiveAt");

-- CreateIndex
CREATE INDEX "anonymous_sessions_sessionToken_idx" ON "anonymous_sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_key_key" ON "api_keys"("key");

-- CreateIndex
CREATE INDEX "api_keys_isActive_idx" ON "api_keys"("isActive");

-- CreateIndex
CREATE INDEX "api_keys_key_idx" ON "api_keys"("key");

-- CreateIndex
CREATE INDEX "authentication_gates_didAuthenticate_idx" ON "authentication_gates"("didAuthenticate");

-- CreateIndex
CREATE INDEX "authentication_gates_gateType_idx" ON "authentication_gates"("gateType");

-- CreateIndex
CREATE INDEX "authentication_gates_sessionToken_idx" ON "authentication_gates"("sessionToken");

-- CreateIndex
CREATE INDEX "authentication_gates_userId_idx" ON "authentication_gates"("userId");

-- CreateIndex
CREATE INDEX "availability_windows_dayOfWeek_idx" ON "availability_windows"("dayOfWeek");

-- CreateIndex
CREATE INDEX "availability_windows_isActive_idx" ON "availability_windows"("isActive");

-- CreateIndex
CREATE INDEX "availability_windows_trainerId_idx" ON "availability_windows"("trainerId");

-- CreateIndex
CREATE INDEX "blocked_users_blockedUserId_idx" ON "blocked_users"("blockedUserId");

-- CreateIndex
CREATE INDEX "blocked_users_userId_idx" ON "blocked_users"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "blocked_users_userId_blockedUserId_key" ON "blocked_users"("userId", "blockedUserId");

-- CreateIndex
CREATE INDEX "booking_waitlist_createdAt_idx" ON "booking_waitlist"("createdAt");

-- CreateIndex
CREATE INDEX "booking_waitlist_playerId_idx" ON "booking_waitlist"("playerId");

-- CreateIndex
CREATE INDEX "booking_waitlist_priority_idx" ON "booking_waitlist"("priority");

-- CreateIndex
CREATE INDEX "booking_waitlist_status_idx" ON "booking_waitlist"("status");

-- CreateIndex
CREATE INDEX "booking_waitlist_trainerId_idx" ON "booking_waitlist"("trainerId");

-- CreateIndex
CREATE INDEX "idx_checkin_templates_trainer" ON "check_in_templates"("trainer_id");

-- CreateIndex
CREATE INDEX "idx_checkins_client" ON "check_ins"("client_id");

-- CreateIndex
CREATE INDEX "idx_checkins_scheduled" ON "check_ins"("scheduled_for");

-- CreateIndex
CREATE INDEX "idx_checkins_status" ON "check_ins"("status");

-- CreateIndex
CREATE INDEX "idx_checkins_template" ON "check_ins"("template_id");

-- CreateIndex
CREATE INDEX "idx_health_scores_client" ON "client_health_scores"("client_id");

-- CreateIndex
CREATE INDEX "idx_health_scores_risk" ON "client_health_scores"("churn_risk");

-- CreateIndex
CREATE INDEX "idx_health_scores_trainer" ON "client_health_scores"("trainer_id");

-- CreateIndex
CREATE UNIQUE INDEX "client_health_scores_client_id_trainer_id_key" ON "client_health_scores"("client_id", "trainer_id");

-- CreateIndex
CREATE INDEX "idx_client_packages_client" ON "client_packages"("client_id");

-- CreateIndex
CREATE INDEX "idx_client_packages_package" ON "client_packages"("package_id");

-- CreateIndex
CREATE INDEX "content_features_contentType_idx" ON "content_features"("contentType");

-- CreateIndex
CREATE INDEX "content_features_engagementScore_idx" ON "content_features"("engagementScore");

-- CreateIndex
CREATE INDEX "content_features_intensity_idx" ON "content_features"("intensity");

-- CreateIndex
CREATE INDEX "content_features_publishedAt_idx" ON "content_features"("publishedAt");

-- CreateIndex
CREATE INDEX "content_features_trainerId_idx" ON "content_features"("trainerId");

-- CreateIndex
CREATE INDEX "content_features_workoutType_idx" ON "content_features"("workoutType");

-- CreateIndex
CREATE UNIQUE INDEX "content_features_contentType_contentId_key" ON "content_features"("contentType", "contentId");

-- CreateIndex
CREATE INDEX "currency_rates_fromCurrency_toCurrency_idx" ON "currency_rates"("fromCurrency", "toCurrency");

-- CreateIndex
CREATE INDEX "currency_rates_isActive_idx" ON "currency_rates"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "currency_rates_fromCurrency_toCurrency_validFrom_key" ON "currency_rates"("fromCurrency", "toCurrency", "validFrom");

-- CreateIndex
CREATE INDEX "email_logs_createdAt_idx" ON "email_logs"("createdAt");

-- CreateIndex
CREATE INDEX "email_logs_emailType_idx" ON "email_logs"("emailType");

-- CreateIndex
CREATE INDEX "email_logs_recipientEmail_idx" ON "email_logs"("recipientEmail");

-- CreateIndex
CREATE INDEX "email_logs_status_idx" ON "email_logs"("status");

-- CreateIndex
CREATE INDEX "idx_videos_specialty" ON "exercise_videos"("specialty");

-- CreateIndex
CREATE INDEX "idx_videos_trainer" ON "exercise_videos"("trainer_id");

-- CreateIndex
CREATE UNIQUE INDEX "exercises_name_key" ON "exercises"("name");

-- CreateIndex
CREATE INDEX "exercises_category_idx" ON "exercises"("category");

-- CreateIndex
CREATE INDEX "exercises_difficulty_idx" ON "exercises"("difficulty");

-- CreateIndex
CREATE INDEX "idx_facilities_category" ON "facilities"("category");

-- CreateIndex
CREATE INDEX "idx_facilities_city" ON "facilities"("city");

-- CreateIndex
CREATE INDEX "idx_facilities_geo_point" ON "facilities" USING GIST ("geo_point");

-- CreateIndex
CREATE INDEX "idx_facilities_source" ON "facilities"("source", "source_id");

-- CreateIndex
CREATE INDEX "idx_facilities_sport" ON "facilities"("sport");

-- CreateIndex
CREATE INDEX "idx_facilities_sport_category" ON "facilities"("sport", "category");

-- CreateIndex
CREATE UNIQUE INDEX "facilities_source_source_id_key" ON "facilities"("source", "source_id");

-- CreateIndex
CREATE INDEX "idx_facility_data_quality_date" ON "facility_data_quality"("date" DESC);

-- CreateIndex
CREATE INDEX "idx_facility_data_quality_facility" ON "facility_data_quality"("facility_id");

-- CreateIndex
CREATE INDEX "idx_facility_data_quality_overall" ON "facility_data_quality"("overall_quality");

-- CreateIndex
CREATE UNIQUE INDEX "facility_data_quality_facility_id_date_key" ON "facility_data_quality"("facility_id", "date");

-- CreateIndex
CREATE INDEX "facility_reports_createdAt_idx" ON "facility_reports"("createdAt");

-- CreateIndex
CREATE INDEX "facility_reports_facilityId_idx" ON "facility_reports"("facilityId");

-- CreateIndex
CREATE INDEX "facility_reports_sport_idx" ON "facility_reports"("sport");

-- CreateIndex
CREATE INDEX "facility_reports_userId_idx" ON "facility_reports"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "facility_sport_mappings_sport_key" ON "facility_sport_mappings"("sport");

-- CreateIndex
CREATE INDEX "idx_facility_sport_mappings_category" ON "facility_sport_mappings"("category");

-- CreateIndex
CREATE INDEX "idx_facility_sport_mappings_sport" ON "facility_sport_mappings"("sport");

-- CreateIndex
CREATE INDEX "feed_sessions_algorithmVersion_idx" ON "feed_sessions"("algorithmVersion");

-- CreateIndex
CREATE INDEX "feed_sessions_startedAt_idx" ON "feed_sessions"("startedAt");

-- CreateIndex
CREATE INDEX "feed_sessions_userId_idx" ON "feed_sessions"("userId");

-- CreateIndex
CREATE INDEX "gia_content_contentType_idx" ON "gia_content"("contentType");

-- CreateIndex
CREATE INDEX "gia_content_userId_idx" ON "gia_content"("userId");

-- CreateIndex
CREATE INDEX "idx_group_class_bookings_class" ON "group_class_bookings"("class_id");

-- CreateIndex
CREATE INDEX "idx_group_class_bookings_client" ON "group_class_bookings"("client_id");

-- CreateIndex
CREATE INDEX "leaderboard_snapshots_periodStart_idx" ON "leaderboard_snapshots"("periodStart");

-- CreateIndex
CREATE INDEX "leaderboard_snapshots_period_idx" ON "leaderboard_snapshots"("period");

-- CreateIndex
CREATE INDEX "maintenance_categories_sport_idx" ON "maintenance_categories"("sport");

-- CreateIndex
CREATE INDEX "maintenance_reports_createdAt_idx" ON "maintenance_reports"("createdAt");

-- CreateIndex
CREATE INDEX "maintenance_reports_facilityId_idx" ON "maintenance_reports"("facilityId");

-- CreateIndex
CREATE INDEX "maintenance_reports_severity_idx" ON "maintenance_reports"("severity");

-- CreateIndex
CREATE INDEX "maintenance_reports_status_idx" ON "maintenance_reports"("status");

-- CreateIndex
CREATE INDEX "maintenance_reports_userId_idx" ON "maintenance_reports"("userId");

-- CreateIndex
CREATE INDEX "messages_createdAt_idx" ON "messages"("createdAt");

-- CreateIndex
CREATE INDEX "messages_receiverId_idx" ON "messages"("receiverId");

-- CreateIndex
CREATE INDEX "messages_senderId_idx" ON "messages"("senderId");

-- CreateIndex
CREATE INDEX "messages_sessionId_idx" ON "messages"("sessionId");

-- CreateIndex
CREATE INDEX "moderation_actions_actionType_idx" ON "moderation_actions"("actionType");

-- CreateIndex
CREATE INDEX "moderation_actions_createdAt_idx" ON "moderation_actions"("createdAt");

-- CreateIndex
CREATE INDEX "moderation_actions_moderatorId_idx" ON "moderation_actions"("moderatorId");

-- CreateIndex
CREATE UNIQUE INDEX "notification_preferences_userId_key" ON "notification_preferences"("userId");

-- CreateIndex
CREATE INDEX "idx_notification_preferences_userId" ON "notification_preferences"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "onboarding_preferences_sessionToken_key" ON "onboarding_preferences"("sessionToken");

-- CreateIndex
CREATE INDEX "onboarding_preferences_sessionToken_idx" ON "onboarding_preferences"("sessionToken");

-- CreateIndex
CREATE INDEX "idx_packages_trainer" ON "packages"("trainer_id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_intents_stripeIntentId_key" ON "payment_intents"("stripeIntentId");

-- CreateIndex
CREATE INDEX "payment_intents_status_idx" ON "payment_intents"("status");

-- CreateIndex
CREATE INDEX "payment_intents_stripeIntentId_idx" ON "payment_intents"("stripeIntentId");

-- CreateIndex
CREATE INDEX "payment_intents_trainerId_idx" ON "payment_intents"("trainerId");

-- CreateIndex
CREATE INDEX "payment_intents_userId_idx" ON "payment_intents"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_sessionId_key" ON "payments"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "phone_numbers_userId_key" ON "phone_numbers"("userId");

-- CreateIndex
CREATE INDEX "phone_numbers_countryCode_idx" ON "phone_numbers"("countryCode");

-- CreateIndex
CREATE INDEX "phone_numbers_userId_idx" ON "phone_numbers"("userId");

-- CreateIndex
CREATE INDEX "plan_adjustments_adjustmentType_idx" ON "plan_adjustments"("adjustmentType");

-- CreateIndex
CREATE INDEX "plan_adjustments_workoutPlanId_idx" ON "plan_adjustments"("workoutPlanId");

-- CreateIndex
CREATE UNIQUE INDEX "premium_subscriptions_userId_key" ON "premium_subscriptions"("userId");

-- CreateIndex
CREATE INDEX "premium_subscriptions_status_idx" ON "premium_subscriptions"("status");

-- CreateIndex
CREATE INDEX "premium_subscriptions_userId_idx" ON "premium_subscriptions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "premium_trials_userId_key" ON "premium_trials"("userId");

-- CreateIndex
CREATE INDEX "premium_trials_status_idx" ON "premium_trials"("status");

-- CreateIndex
CREATE INDEX "premium_trials_userId_idx" ON "premium_trials"("userId");

-- CreateIndex
CREATE INDEX "idx_realtime_updates_created_at" ON "realtime_updates"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_realtime_updates_user_id" ON "realtime_updates"("user_id");

-- CreateIndex
CREATE INDEX "idx_realtime_updates_user_id_created_at" ON "realtime_updates"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "recommendation_scores_computedAt_idx" ON "recommendation_scores"("computedAt");

-- CreateIndex
CREATE INDEX "recommendation_scores_expiresAt_idx" ON "recommendation_scores"("expiresAt");

-- CreateIndex
CREATE INDEX "recommendation_scores_finalScore_idx" ON "recommendation_scores"("finalScore");

-- CreateIndex
CREATE INDEX "recommendation_scores_userId_idx" ON "recommendation_scores"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "recommendation_scores_userId_contentType_contentId_key" ON "recommendation_scores"("userId", "contentType", "contentId");

-- CreateIndex
CREATE INDEX "referral_tracking_converted_idx" ON "referral_tracking"("converted");

-- CreateIndex
CREATE INDEX "referral_tracking_referralCode_idx" ON "referral_tracking"("referralCode");

-- CreateIndex
CREATE INDEX "referral_tracking_referrerId_idx" ON "referral_tracking"("referrerId");

-- CreateIndex
CREATE UNIQUE INDEX "refunds_paymentId_key" ON "refunds"("paymentId");

-- CreateIndex
CREATE INDEX "refunds_paymentId_idx" ON "refunds"("paymentId");

-- CreateIndex
CREATE INDEX "refunds_status_idx" ON "refunds"("status");

-- CreateIndex
CREATE INDEX "regional_availability_contentType_idx" ON "regional_availability"("contentType");

-- CreateIndex
CREATE UNIQUE INDEX "regional_availability_contentType_contentId_key" ON "regional_availability"("contentType", "contentId");

-- CreateIndex
CREATE INDEX "report_confirmations_reportId_idx" ON "report_confirmations"("reportId");

-- CreateIndex
CREATE INDEX "report_confirmations_userId_idx" ON "report_confirmations"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "reporter_badges_name_key" ON "reporter_badges"("name");

-- CreateIndex
CREATE INDEX "reports_createdAt_idx" ON "reports"("createdAt");

-- CreateIndex
CREATE INDEX "reports_reportedUserId_idx" ON "reports"("reportedUserId");

-- CreateIndex
CREATE INDEX "reports_reporterId_idx" ON "reports"("reporterId");

-- CreateIndex
CREATE INDEX "reports_status_idx" ON "reports"("status");

-- CreateIndex
CREATE INDEX "rescheduling_attempts_conflictId_idx" ON "rescheduling_attempts"("conflictId");

-- CreateIndex
CREATE INDEX "rescheduling_attempts_sessionId_idx" ON "rescheduling_attempts"("sessionId");

-- CreateIndex
CREATE INDEX "rescheduling_attempts_status_idx" ON "rescheduling_attempts"("status");

-- CreateIndex
CREATE INDEX "rescheduling_metrics_periodStart_idx" ON "rescheduling_metrics"("periodStart");

-- CreateIndex
CREATE INDEX "rescheduling_metrics_trainerId_idx" ON "rescheduling_metrics"("trainerId");

-- CreateIndex
CREATE INDEX "rescheduling_rules_isActive_idx" ON "rescheduling_rules"("isActive");

-- CreateIndex
CREATE INDEX "rescheduling_rules_trainerId_idx" ON "rescheduling_rules"("trainerId");

-- CreateIndex
CREATE INDEX "idx_retention_alerts_dismissed" ON "retention_alerts"("is_dismissed");

-- CreateIndex
CREATE INDEX "idx_retention_alerts_trainer" ON "retention_alerts"("trainer_id");

-- CreateIndex
CREATE INDEX "scheduling_conflicts_detectedAt_idx" ON "scheduling_conflicts"("detectedAt");

-- CreateIndex
CREATE INDEX "scheduling_conflicts_sessionId_idx" ON "scheduling_conflicts"("sessionId");

-- CreateIndex
CREATE INDEX "scheduling_conflicts_status_idx" ON "scheduling_conflicts"("status");

-- CreateIndex
CREATE INDEX "scheduling_conflicts_trainerId_idx" ON "scheduling_conflicts"("trainerId");

-- CreateIndex
CREATE INDEX "idx_scraper_jobs_created_at" ON "scraper_jobs"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_scraper_jobs_sport" ON "scraper_jobs"("sport");

-- CreateIndex
CREATE INDEX "idx_scraper_jobs_status" ON "scraper_jobs"("status");

-- CreateIndex
CREATE INDEX "idx_scraper_logs_job_id" ON "scraper_logs"("job_id");

-- CreateIndex
CREATE INDEX "idx_scraper_logs_level" ON "scraper_logs"("level");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "stripe_accounts_userId_key" ON "stripe_accounts"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "stripe_accounts_stripeAccountId_key" ON "stripe_accounts"("stripeAccountId");

-- CreateIndex
CREATE INDEX "stripe_accounts_stripeAccountId_idx" ON "stripe_accounts"("stripeAccountId");

-- CreateIndex
CREATE INDEX "stripe_accounts_userId_idx" ON "stripe_accounts"("userId");

-- CreateIndex
CREATE INDEX "subscription_history_createdAt_idx" ON "subscription_history"("createdAt");

-- CreateIndex
CREATE INDEX "subscription_history_eventType_idx" ON "subscription_history"("eventType");

-- CreateIndex
CREATE INDEX "subscription_history_userId_idx" ON "subscription_history"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_plans_name_key" ON "subscription_plans"("name");

-- CreateIndex
CREATE INDEX "subscription_plans_isActive_idx" ON "subscription_plans"("isActive");

-- CreateIndex
CREATE INDEX "subscription_plans_name_idx" ON "subscription_plans"("name");

-- CreateIndex
CREATE INDEX "subscription_usage_date_idx" ON "subscription_usage"("date");

-- CreateIndex
CREATE INDEX "subscription_usage_featureType_idx" ON "subscription_usage"("featureType");

-- CreateIndex
CREATE INDEX "subscription_usage_subscriptionId_idx" ON "subscription_usage"("subscriptionId");

-- CreateIndex
CREATE INDEX "subscription_usage_userId_date_idx" ON "subscription_usage"("userId", "date");

-- CreateIndex
CREATE INDEX "subscription_usage_userId_idx" ON "subscription_usage"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "supported_regions_countryCode_key" ON "supported_regions"("countryCode");

-- CreateIndex
CREATE INDEX "supported_regions_countryCode_idx" ON "supported_regions"("countryCode");

-- CreateIndex
CREATE INDEX "supported_regions_isSupported_idx" ON "supported_regions"("isSupported");

-- CreateIndex
CREATE INDEX "trainer_pricing_baseCurrency_idx" ON "trainer_pricing"("baseCurrency");

-- CreateIndex
CREATE INDEX "trainer_pricing_trainerId_idx" ON "trainer_pricing"("trainerId");

-- CreateIndex
CREATE UNIQUE INDEX "trainer_verifications_trainerId_key" ON "trainer_verifications"("trainerId");

-- CreateIndex
CREATE INDEX "trainer_verifications_status_idx" ON "trainer_verifications"("status");

-- CreateIndex
CREATE INDEX "trainer_verifications_trainerId_idx" ON "trainer_verifications"("trainerId");

-- CreateIndex
CREATE UNIQUE INDEX "trainers_user_id_key" ON "trainers"("user_id");

-- CreateIndex
CREATE INDEX "idx_trainers_pricing" ON "trainers" USING GIN ("pricing");

-- CreateIndex
CREATE INDEX "idx_trainers_user_id" ON "trainers"("user_id");

-- CreateIndex
CREATE INDEX "translations_contentType_contentId_idx" ON "translations"("contentType", "contentId");

-- CreateIndex
CREATE INDEX "translations_language_idx" ON "translations"("language");

-- CreateIndex
CREATE UNIQUE INDEX "translations_contentType_contentId_fieldName_language_key" ON "translations"("contentType", "contentId", "fieldName", "language");

-- CreateIndex
CREATE INDEX "user_badges_earnedAt_idx" ON "user_badges"("earnedAt");

-- CreateIndex
CREATE INDEX "user_badges_userId_idx" ON "user_badges"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_badges_userId_badgeId_key" ON "user_badges"("userId", "badgeId");

-- CreateIndex
CREATE UNIQUE INDEX "user_bans_userId_key" ON "user_bans"("userId");

-- CreateIndex
CREATE INDEX "user_bans_expiresAt_idx" ON "user_bans"("expiresAt");

-- CreateIndex
CREATE INDEX "user_bans_isActive_idx" ON "user_bans"("isActive");

-- CreateIndex
CREATE INDEX "user_bans_userId_idx" ON "user_bans"("userId");

-- CreateIndex
CREATE INDEX "user_challenges_completed_idx" ON "user_challenges"("completed");

-- CreateIndex
CREATE INDEX "user_challenges_userId_idx" ON "user_challenges"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_challenges_userId_challengeId_key" ON "user_challenges"("userId", "challengeId");

-- CreateIndex
CREATE INDEX "user_interactions_action_idx" ON "user_interactions"("action");

-- CreateIndex
CREATE INDEX "user_interactions_contentType_contentId_idx" ON "user_interactions"("contentType", "contentId");

-- CreateIndex
CREATE INDEX "user_interactions_createdAt_idx" ON "user_interactions"("createdAt");

-- CreateIndex
CREATE INDEX "user_interactions_sessionId_idx" ON "user_interactions"("sessionId");

-- CreateIndex
CREATE INDEX "user_interactions_userId_idx" ON "user_interactions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_locales_userId_key" ON "user_locales"("userId");

-- CreateIndex
CREATE INDEX "user_locales_country_idx" ON "user_locales"("country");

-- CreateIndex
CREATE INDEX "user_locales_language_idx" ON "user_locales"("language");

-- CreateIndex
CREATE INDEX "user_locales_userId_idx" ON "user_locales"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_preferences_userId_key" ON "user_preferences"("userId");

-- CreateIndex
CREATE INDEX "user_preferences_engagementScore_idx" ON "user_preferences"("engagementScore");

-- CreateIndex
CREATE INDEX "user_preferences_lastComputed_idx" ON "user_preferences"("lastComputed");

-- CreateIndex
CREATE INDEX "user_preferences_userId_idx" ON "user_preferences"("userId");

-- CreateIndex
CREATE INDEX "user_reporter_stats_level_idx" ON "user_reporter_stats"("level");

-- CreateIndex
CREATE INDEX "user_reporter_stats_totalReports_idx" ON "user_reporter_stats"("totalReports");

-- CreateIndex
CREATE INDEX "user_reporter_stats_weeklyRank_idx" ON "user_reporter_stats"("weeklyRank");

-- CreateIndex
CREATE UNIQUE INDEX "user_reputation_user_id_key" ON "user_reputation"("user_id");

-- CreateIndex
CREATE INDEX "idx_user_reputation_score" ON "user_reputation"("reputation_score" DESC);

-- CreateIndex
CREATE INDEX "idx_user_reputation_tier" ON "user_reputation"("reputation_tier");

-- CreateIndex
CREATE INDEX "idx_user_reputation_user_id" ON "user_reputation"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_subscriptions_stripeSubscriptionId_key" ON "user_subscriptions"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "user_subscriptions_currentPeriodEnd_idx" ON "user_subscriptions"("currentPeriodEnd");

-- CreateIndex
CREATE INDEX "user_subscriptions_status_idx" ON "user_subscriptions"("status");

-- CreateIndex
CREATE INDEX "user_subscriptions_stripeSubscriptionId_idx" ON "user_subscriptions"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "user_subscriptions_userId_idx" ON "user_subscriptions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_subscriptions_userId_planId_key" ON "user_subscriptions"("userId", "planId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_clerkId_key" ON "users"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE INDEX "idx_video_shares_client" ON "video_shares"("client_id");

-- CreateIndex
CREATE INDEX "idx_video_shares_video" ON "video_shares"("video_id");

-- CreateIndex
CREATE INDEX "viral_content_contentType_idx" ON "viral_content"("contentType");

-- CreateIndex
CREATE INDEX "viral_content_userId_idx" ON "viral_content"("userId");

-- CreateIndex
CREATE INDEX "viral_metrics_metricType_idx" ON "viral_metrics"("metricType");

-- CreateIndex
CREATE INDEX "viral_metrics_platform_idx" ON "viral_metrics"("platform");

-- CreateIndex
CREATE INDEX "viral_metrics_userId_idx" ON "viral_metrics"("userId");

-- CreateIndex
CREATE INDEX "idx_waitlist_client" ON "waitlist_entries"("client_id");

-- CreateIndex
CREATE INDEX "idx_waitlist_session" ON "waitlist_entries"("session_id");

-- CreateIndex
CREATE INDEX "idx_waitlist_status" ON "waitlist_entries"("status");

-- CreateIndex
CREATE INDEX "waitlist_notifications_playerId_idx" ON "waitlist_notifications"("playerId");

-- CreateIndex
CREATE INDEX "waitlist_notifications_sentAt_idx" ON "waitlist_notifications"("sentAt");

-- CreateIndex
CREATE INDEX "waitlist_notifications_trainerId_idx" ON "waitlist_notifications"("trainerId");

-- CreateIndex
CREATE INDEX "waitlist_notifications_waitlistId_idx" ON "waitlist_notifications"("waitlistId");

-- CreateIndex
CREATE INDEX "workout_plans_clientId_idx" ON "workout_plans"("clientId");

-- CreateIndex
CREATE INDEX "workout_plans_goal_idx" ON "workout_plans"("goal");

-- CreateIndex
CREATE INDEX "workout_plans_status_idx" ON "workout_plans"("status");

-- CreateIndex
CREATE INDEX "workout_plans_trainerId_idx" ON "workout_plans"("trainerId");

-- CreateIndex
CREATE INDEX "workout_progress_clientId_idx" ON "workout_progress"("clientId");

-- CreateIndex
CREATE INDEX "workout_progress_date_idx" ON "workout_progress"("date");

-- CreateIndex
CREATE INDEX "workout_progress_workoutPlanId_idx" ON "workout_progress"("workoutPlanId");

-- CreateIndex
CREATE INDEX "workout_sessions_scheduledFor_idx" ON "workout_sessions"("scheduledFor");

-- CreateIndex
CREATE INDEX "workout_sessions_status_idx" ON "workout_sessions"("status");

-- CreateIndex
CREATE INDEX "workout_sessions_workoutPlanId_idx" ON "workout_sessions"("workoutPlanId");

-- CreateIndex
CREATE INDEX "gia_programs_instructorId_idx" ON "gia_programs"("instructorId");

-- CreateIndex
CREATE INDEX "gia_programs_type_idx" ON "gia_programs"("type");

-- CreateIndex
CREATE INDEX "gia_programs_sportCategory_idx" ON "gia_programs"("sportCategory");

-- CreateIndex
CREATE INDEX "gia_programs_createdAt_idx" ON "gia_programs"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "gia_program_usage_programId_idx" ON "gia_program_usage"("programId");

-- CreateIndex
CREATE INDEX "gia_program_usage_instructorId_idx" ON "gia_program_usage"("instructorId");

-- CreateIndex
CREATE UNIQUE INDEX "ambassadors_userId_key" ON "ambassadors"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ambassadors_email_key" ON "ambassadors"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ambassadors_referralCode_key" ON "ambassadors"("referralCode");

-- CreateIndex
CREATE INDEX "ambassadors_userId_idx" ON "ambassadors"("userId");

-- CreateIndex
CREATE INDEX "ambassadors_email_idx" ON "ambassadors"("email");

-- CreateIndex
CREATE INDEX "ambassadors_referralCode_idx" ON "ambassadors"("referralCode");

-- CreateIndex
CREATE INDEX "ambassadors_isActive_idx" ON "ambassadors"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "referrals_referredUserId_key" ON "referrals"("referredUserId");

-- CreateIndex
CREATE INDEX "referrals_ambassadorId_idx" ON "referrals"("ambassadorId");

-- CreateIndex
CREATE INDEX "referrals_referredUserId_idx" ON "referrals"("referredUserId");

-- CreateIndex
CREATE INDEX "referrals_referralCode_idx" ON "referrals"("referralCode");

-- CreateIndex
CREATE INDEX "referrals_status_idx" ON "referrals"("status");

-- CreateIndex
CREATE INDEX "commissions_ambassadorId_idx" ON "commissions"("ambassadorId");

-- CreateIndex
CREATE INDEX "commissions_referralId_idx" ON "commissions"("referralId");

-- CreateIndex
CREATE INDEX "commissions_status_idx" ON "commissions"("status");

-- CreateIndex
CREATE INDEX "commissions_type_idx" ON "commissions"("type");

-- CreateIndex
CREATE INDEX "payouts_ambassadorId_idx" ON "payouts"("ambassadorId");

-- CreateIndex
CREATE INDEX "payouts_status_idx" ON "payouts"("status");

-- CreateIndex
CREATE INDEX "payout_requests_ambassadorId_idx" ON "payout_requests"("ambassadorId");

-- CreateIndex
CREATE INDEX "payout_requests_status_idx" ON "payout_requests"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ambassador_magic_links_token_key" ON "ambassador_magic_links"("token");

-- CreateIndex
CREATE INDEX "ambassador_magic_links_token_idx" ON "ambassador_magic_links"("token");

-- CreateIndex
CREATE INDEX "ambassador_magic_links_ambassadorId_idx" ON "ambassador_magic_links"("ambassadorId");

-- CreateIndex
CREATE UNIQUE INDEX "ambassador_sessions_sessionToken_key" ON "ambassador_sessions"("sessionToken");

-- CreateIndex
CREATE INDEX "ambassador_sessions_sessionToken_idx" ON "ambassador_sessions"("sessionToken");

-- CreateIndex
CREATE INDEX "ambassador_sessions_ambassadorId_idx" ON "ambassador_sessions"("ambassadorId");

-- CreateIndex
CREATE UNIQUE INDEX "trainer_profiles_userId_key" ON "trainer_profiles"("userId");

-- CreateIndex
CREATE INDEX "trainer_profiles_userId_idx" ON "trainer_profiles"("userId");

-- CreateIndex
CREATE INDEX "trainer_profiles_tier_idx" ON "trainer_profiles"("tier");

-- CreateIndex
CREATE INDEX "trainer_profiles_isVerified_idx" ON "trainer_profiles"("isVerified");

-- CreateIndex
CREATE INDEX "trainer_profiles_monthlyRevenue_idx" ON "trainer_profiles"("monthlyRevenue");

-- CreateIndex
CREATE INDEX "success_stories_trainerProfileId_idx" ON "success_stories"("trainerProfileId");

-- CreateIndex
CREATE INDEX "success_stories_isPublic_idx" ON "success_stories"("isPublic");

-- CreateIndex
CREATE INDEX "success_stories_createdAt_idx" ON "success_stories"("createdAt");

-- CreateIndex
CREATE INDEX "community_posts_trainerId_idx" ON "community_posts"("trainerId");

-- CreateIndex
CREATE INDEX "community_posts_type_idx" ON "community_posts"("type");

-- CreateIndex
CREATE INDEX "community_posts_createdAt_idx" ON "community_posts"("createdAt");

-- CreateIndex
CREATE INDEX "community_posts_likes_idx" ON "community_posts"("likes");

-- AddForeignKey
ALTER TABLE "ab_test_assignments" ADD CONSTRAINT "ab_test_assignments_testName_fkey" FOREIGN KEY ("testName") REFERENCES "ab_tests"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ab_test_conversions" ADD CONSTRAINT "ab_test_conversions_testName_fkey" FOREIGN KEY ("testName") REFERENCES "ab_tests"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ab_test_results" ADD CONSTRAINT "ab_test_results_testName_fkey" FOREIGN KEY ("testName") REFERENCES "ab_tests"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_persona_earnings" ADD CONSTRAINT "ai_persona_earnings_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "ai_personas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_persona_feedback" ADD CONSTRAINT "ai_persona_feedback_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "ai_personas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_persona_sessions" ADD CONSTRAINT "ai_persona_sessions_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "ai_personas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics" ADD CONSTRAINT "analytics_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_appClientId_fkey" FOREIGN KEY ("appClientId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "trainer_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_adjustments" ADD CONSTRAINT "plan_adjustments_workoutPlanId_fkey" FOREIGN KEY ("workoutPlanId") REFERENCES "workout_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_usage" ADD CONSTRAINT "subscription_usage_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "user_subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trainer_sessions" ADD CONSTRAINT "trainer_sessions_appClientId_fkey" FOREIGN KEY ("appClientId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trainer_sessions" ADD CONSTRAINT "trainer_sessions_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trainer_sessions" ADD CONSTRAINT "trainer_sessions_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "reporter_badges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_challenges" ADD CONSTRAINT "user_challenges_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "reporter_challenges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_planId_fkey" FOREIGN KEY ("planId") REFERENCES "subscription_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "viral_content" ADD CONSTRAINT "viral_content_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_progress" ADD CONSTRAINT "workout_progress_workoutPlanId_fkey" FOREIGN KEY ("workoutPlanId") REFERENCES "workout_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_sessions" ADD CONSTRAINT "workout_sessions_workoutPlanId_fkey" FOREIGN KEY ("workoutPlanId") REFERENCES "workout_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gia_programs" ADD CONSTRAINT "gia_programs_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gia_program_usage" ADD CONSTRAINT "gia_program_usage_programId_fkey" FOREIGN KEY ("programId") REFERENCES "gia_programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gia_program_usage" ADD CONSTRAINT "gia_program_usage_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gia_program_usage" ADD CONSTRAINT "gia_program_usage_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ambassadors" ADD CONSTRAINT "ambassadors_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_ambassadorId_fkey" FOREIGN KEY ("ambassadorId") REFERENCES "ambassadors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referredUserId_fkey" FOREIGN KEY ("referredUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_ambassadorId_fkey" FOREIGN KEY ("ambassadorId") REFERENCES "ambassadors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_referralId_fkey" FOREIGN KEY ("referralId") REFERENCES "referrals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_ambassadorId_fkey" FOREIGN KEY ("ambassadorId") REFERENCES "ambassadors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payout_requests" ADD CONSTRAINT "payout_requests_ambassadorId_fkey" FOREIGN KEY ("ambassadorId") REFERENCES "ambassadors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ambassador_magic_links" ADD CONSTRAINT "ambassador_magic_links_ambassadorId_fkey" FOREIGN KEY ("ambassadorId") REFERENCES "ambassadors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ambassador_sessions" ADD CONSTRAINT "ambassador_sessions_ambassadorId_fkey" FOREIGN KEY ("ambassadorId") REFERENCES "ambassadors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trainer_profiles" ADD CONSTRAINT "trainer_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "success_stories" ADD CONSTRAINT "success_stories_trainerProfileId_fkey" FOREIGN KEY ("trainerProfileId") REFERENCES "trainer_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

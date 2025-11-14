-- ═══════════════════════════════════════════════════════════════════════
-- 🚀 PUBLIC BOOKING SYSTEM (Pre-App Launch)
-- ═══════════════════════════════════════════════════════════════════════
-- Date: November 13, 2025
-- Purpose: Allow trainers to accept bookings via public link before app launch
-- ═══════════════════════════════════════════════════════════════════════

-- ========================================
-- BOOKING SETTINGS & SESSION TYPES
-- ========================================

CREATE TABLE IF NOT EXISTS "booking_settings" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "trainer_id" TEXT NOT NULL UNIQUE REFERENCES "users"("id") ON DELETE CASCADE,
  
  -- Public booking link
  "booking_slug" TEXT NOT NULL UNIQUE,
  
  -- Display settings
  "display_name" TEXT NOT NULL,
  "bio" TEXT,
  "profile_photo_url" TEXT,
  
  -- Booking rules
  "advance_booking_days" INTEGER NOT NULL DEFAULT 30,
  "min_notice_hours" INTEGER NOT NULL DEFAULT 24,
  "buffer_minutes" INTEGER NOT NULL DEFAULT 15,
  
  -- Session types (JSON array)
  -- Format: [{ id: "1on1", name: "1-on-1 Training", duration: 60, price: 75, description: "...", stripe_price_id: "price_..." }]
  "session_types" JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Settings
  "require_payment" BOOLEAN NOT NULL DEFAULT true,
  "auto_approve" BOOLEAN NOT NULL DEFAULT true,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_booking_settings_slug" ON "booking_settings"("booking_slug");
CREATE INDEX IF NOT EXISTS "idx_booking_settings_trainer" ON "booking_settings"("trainer_id");

-- ========================================
-- TRAINER WEEKLY AVAILABILITY
-- ========================================

CREATE TABLE IF NOT EXISTS "trainer_availability" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "settings_id" TEXT NOT NULL REFERENCES "booking_settings"("id") ON DELETE CASCADE,
  
  -- Day of week (0 = Sunday, 6 = Saturday)
  "day_of_week" INTEGER NOT NULL CHECK ("day_of_week" BETWEEN 0 AND 6),
  
  -- Time slots (24-hour format: "09:00", "17:30")
  "start_time" TEXT NOT NULL,
  "end_time" TEXT NOT NULL,
  
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_trainer_availability_settings" ON "trainer_availability"("settings_id");
CREATE INDEX IF NOT EXISTS "idx_trainer_availability_day" ON "trainer_availability"("day_of_week");

-- ========================================
-- BLOCKED TIME SLOTS
-- ========================================

CREATE TABLE IF NOT EXISTS "blocked_time_slots" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "settings_id" TEXT NOT NULL REFERENCES "booking_settings"("id") ON DELETE CASCADE,
  
  "start_time" TIMESTAMP NOT NULL,
  "end_time" TIMESTAMP NOT NULL,
  "reason" TEXT,
  
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_blocked_slots_settings" ON "blocked_time_slots"("settings_id");
CREATE INDEX IF NOT EXISTS "idx_blocked_slots_time" ON "blocked_time_slots"("start_time");

-- ========================================
-- PUBLIC BOOKINGS
-- ========================================

CREATE TABLE IF NOT EXISTS "public_bookings" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "settings_id" TEXT NOT NULL REFERENCES "booking_settings"("id") ON DELETE CASCADE,
  "trainer_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  
  -- Client info (no login required)
  "client_name" TEXT NOT NULL,
  "client_email" TEXT NOT NULL,
  "client_phone" TEXT,
  
  -- Booking details
  "session_type_id" TEXT NOT NULL,
  "session_type_name" TEXT NOT NULL,
  "start_time" TIMESTAMP NOT NULL,
  "end_time" TIMESTAMP NOT NULL,
  "duration" INTEGER NOT NULL,
  
  -- Payment
  "price" DECIMAL(10,2) NOT NULL,
  "stripe_price_id" TEXT,
  "stripe_payment_intent_id" TEXT,
  "stripe_session_id" TEXT,
  "payment_status" TEXT NOT NULL DEFAULT 'pending',
  
  -- Status
  "status" TEXT NOT NULL DEFAULT 'pending',
  "notes" TEXT,
  
  -- Timestamps
  "booked_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "confirmed_at" TIMESTAMP,
  "cancelled_at" TIMESTAMP,
  "completed_at" TIMESTAMP,
  
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_public_bookings_trainer" ON "public_bookings"("trainer_id");
CREATE INDEX IF NOT EXISTS "idx_public_bookings_start_time" ON "public_bookings"("start_time");
CREATE INDEX IF NOT EXISTS "idx_public_bookings_status" ON "public_bookings"("status");
CREATE INDEX IF NOT EXISTS "idx_public_bookings_email" ON "public_bookings"("client_email");

-- ========================================
-- TRIGGERS FOR UPDATED_AT
-- ========================================

-- Booking settings
CREATE TRIGGER IF NOT EXISTS update_booking_settings_updated_at 
BEFORE UPDATE ON "booking_settings" 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trainer availability
CREATE TRIGGER IF NOT EXISTS update_trainer_availability_updated_at 
BEFORE UPDATE ON "trainer_availability" 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Public bookings
CREATE TRIGGER IF NOT EXISTS update_public_bookings_updated_at 
BEFORE UPDATE ON "public_bookings" 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════════════
-- ✅ MIGRATION COMPLETE
-- ═══════════════════════════════════════════════════════════════════════
-- Next steps:
-- 1. Run this migration in Supabase SQL Editor
-- 2. Trainers can set up their booking page in dashboard
-- 3. Share link: goodrunss.com/book/{trainer-slug}
-- 4. Start accepting bookings and payments before app launch!
-- ═══════════════════════════════════════════════════════════════════════





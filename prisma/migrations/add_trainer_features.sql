-- Migration: Add Package Sales, Waitlist, Check-ins, Video Library, Group Classes
-- Date: November 11, 2025
-- Features: B, C, D, E, F, H from feature suggestions

-- ========================================
-- B. PACKAGE/MEMBERSHIP SALES
-- ========================================

CREATE TABLE "packages" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "trainer_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "sessions" INTEGER NOT NULL,
  "price" DECIMAL(10,2) NOT NULL,
  "validity_days" INTEGER NOT NULL DEFAULT 90,
  "is_recurring" BOOLEAN NOT NULL DEFAULT false,
  "recurring_interval" TEXT, -- monthly, quarterly, yearly
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE "client_packages" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "client_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "package_id" TEXT NOT NULL REFERENCES "packages"("id") ON DELETE CASCADE,
  "sessions_total" INTEGER NOT NULL,
  "sessions_used" INTEGER NOT NULL DEFAULT 0,
  "purchased_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "expires_at" TIMESTAMP,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "stripe_subscription_id" TEXT,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX "idx_packages_trainer" ON "packages"("trainer_id");
CREATE INDEX "idx_client_packages_client" ON "client_packages"("client_id");
CREATE INDEX "idx_client_packages_package" ON "client_packages"("package_id");

-- ========================================
-- C. WAITLIST MANAGEMENT
-- ========================================

CREATE TABLE "waitlist_entries" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "session_id" TEXT NOT NULL REFERENCES "trainer_sessions"("id") ON DELETE CASCADE,
  "client_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "position" INTEGER NOT NULL,
  "added_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "notified_at" TIMESTAMP,
  "claimed_at" TIMESTAMP,
  "expired_at" TIMESTAMP,
  "status" TEXT NOT NULL DEFAULT 'waiting', -- waiting, notified, claimed, expired
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX "idx_waitlist_session" ON "waitlist_entries"("session_id");
CREATE INDEX "idx_waitlist_client" ON "waitlist_entries"("client_id");
CREATE INDEX "idx_waitlist_status" ON "waitlist_entries"("status");

-- ========================================
-- D. VIDEO EXERCISE LIBRARY
-- ========================================

CREATE TABLE "exercise_videos" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "trainer_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "video_url" TEXT NOT NULL,
  "thumbnail_url" TEXT,
  "duration" INTEGER, -- seconds
  "category" TEXT, -- muscle_group, movement_pattern, etc.
  "tags" TEXT[],
  "specialty" TEXT, -- basketball, yoga, etc.
  "difficulty" TEXT, -- beginner, intermediate, advanced
  "equipment" TEXT[],
  "view_count" INTEGER NOT NULL DEFAULT 0,
  "is_public" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE "video_shares" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "video_id" TEXT NOT NULL REFERENCES "exercise_videos"("id") ON DELETE CASCADE,
  "client_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "shared_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "viewed_at" TIMESTAMP,
  "view_count" INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX "idx_videos_trainer" ON "exercise_videos"("trainer_id");
CREATE INDEX "idx_videos_specialty" ON "exercise_videos"("specialty");
CREATE INDEX "idx_video_shares_video" ON "video_shares"("video_id");
CREATE INDEX "idx_video_shares_client" ON "video_shares"("client_id");

-- ========================================
-- E. AUTOMATED CHECK-INS
-- ========================================

CREATE TABLE "check_in_templates" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "trainer_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "type" TEXT NOT NULL, -- daily, weekly, pre_session, post_session
  "questions" JSONB NOT NULL, -- array of {question, type, options}
  "schedule" TEXT, -- cron expression for auto-send
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE "check_ins" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "template_id" TEXT NOT NULL REFERENCES "check_in_templates"("id") ON DELETE CASCADE,
  "client_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "scheduled_for" TIMESTAMP NOT NULL,
  "completed_at" TIMESTAMP,
  "responses" JSONB, -- answers to questions
  "status" TEXT NOT NULL DEFAULT 'pending', -- pending, completed, skipped
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX "idx_checkin_templates_trainer" ON "check_in_templates"("trainer_id");
CREATE INDEX "idx_checkins_template" ON "check_ins"("template_id");
CREATE INDEX "idx_checkins_client" ON "check_ins"("client_id");
CREATE INDEX "idx_checkins_status" ON "check_ins"("status");
CREATE INDEX "idx_checkins_scheduled" ON "check_ins"("scheduled_for");

-- ========================================
-- F. GROUP CLASS MANAGEMENT
-- ========================================

CREATE TABLE "group_classes" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "trainer_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "max_capacity" INTEGER NOT NULL,
  "current_bookings" INTEGER NOT NULL DEFAULT 0,
  "price_per_person" DECIMAL(10,2) NOT NULL,
  "scheduled_at" TIMESTAMP NOT NULL,
  "duration" INTEGER NOT NULL, -- minutes
  "location" TEXT,
  "is_recurring" BOOLEAN NOT NULL DEFAULT false,
  "recurring_pattern" TEXT, -- weekly-monday-6pm, etc.
  "status" TEXT NOT NULL DEFAULT 'scheduled', -- scheduled, in_progress, completed, cancelled
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE "group_class_bookings" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "class_id" TEXT NOT NULL REFERENCES "group_classes"("id") ON DELETE CASCADE,
  "client_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "status" TEXT NOT NULL DEFAULT 'confirmed', -- confirmed, cancelled, attended
  "booked_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "cancelled_at" TIMESTAMP,
  "attended_at" TIMESTAMP,
  "payment_id" TEXT REFERENCES "payments"("id"),
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX "idx_group_classes_trainer" ON "group_classes"("trainer_id");
CREATE INDEX "idx_group_classes_scheduled" ON "group_classes"("scheduled_at");
CREATE INDEX "idx_group_class_bookings_class" ON "group_class_bookings"("class_id");
CREATE INDEX "idx_group_class_bookings_client" ON "group_class_bookings"("client_id");

-- ========================================
-- H. CLIENT RETENTION TRACKING (Enhancement)
-- ========================================

CREATE TABLE "client_health_scores" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "client_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "trainer_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "health_score" INTEGER NOT NULL, -- 0-100
  "attendance_rate" DECIMAL(5,2),
  "check_in_rate" DECIMAL(5,2),
  "response_time_hours" DECIMAL(10,2),
  "days_since_last_session" INTEGER,
  "churn_risk" TEXT, -- low, medium, high
  "last_calculated_at" TIMESTAMP NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE("client_id", "trainer_id")
);

CREATE TABLE "retention_alerts" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "trainer_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "client_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "alert_type" TEXT NOT NULL, -- no_session_2weeks, low_attendance, no_checkin, payment_overdue
  "severity" TEXT NOT NULL, -- info, warning, critical
  "message" TEXT NOT NULL,
  "action_suggested" TEXT,
  "is_dismissed" BOOLEAN NOT NULL DEFAULT false,
  "dismissed_at" TIMESTAMP,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX "idx_health_scores_client" ON "client_health_scores"("client_id");
CREATE INDEX "idx_health_scores_trainer" ON "client_health_scores"("trainer_id");
CREATE INDEX "idx_health_scores_risk" ON "client_health_scores"("churn_risk");
CREATE INDEX "idx_retention_alerts_trainer" ON "retention_alerts"("trainer_id");
CREATE INDEX "idx_retention_alerts_dismissed" ON "retention_alerts"("is_dismissed");

-- Add updated_at triggers (PostgreSQL)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_packages_updated_at BEFORE UPDATE ON packages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_client_packages_updated_at BEFORE UPDATE ON client_packages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_waitlist_entries_updated_at BEFORE UPDATE ON waitlist_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_exercise_videos_updated_at BEFORE UPDATE ON exercise_videos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_check_in_templates_updated_at BEFORE UPDATE ON check_in_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_check_ins_updated_at BEFORE UPDATE ON check_ins FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_group_classes_updated_at BEFORE UPDATE ON group_classes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_group_class_bookings_updated_at BEFORE UPDATE ON group_class_bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_client_health_scores_updated_at BEFORE UPDATE ON client_health_scores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_retention_alerts_updated_at BEFORE UPDATE ON retention_alerts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();














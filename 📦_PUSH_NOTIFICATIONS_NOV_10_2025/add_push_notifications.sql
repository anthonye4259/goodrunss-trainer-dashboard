-- ═══════════════════════════════════════════════════════════════════════
-- PUSH NOTIFICATIONS SYSTEM
-- Add FCM tokens to users and create notification preferences table
-- ═══════════════════════════════════════════════════════════════════════

-- Add fcmTokens field to users table (stores array of device tokens)
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "fcmTokens" TEXT[] DEFAULT '{}';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS "idx_users_fcm_tokens" ON "users" USING GIN ("fcmTokens");

-- ═══════════════════════════════════════════════════════════════════════
-- NOTIFICATION PREFERENCES TABLE
-- ═══════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS "notification_preferences" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "userId" TEXT NOT NULL UNIQUE,
  
  -- Notification type toggles
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
  
  CONSTRAINT "notification_preferences_userId_fkey" FOREIGN KEY ("userId") 
    REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS "idx_notification_preferences_userId" 
  ON "notification_preferences"("userId");

-- ═══════════════════════════════════════════════════════════════════════
-- ADD deliveryStatus to existing notifications table (if it exists)
-- ═══════════════════════════════════════════════════════════════════════

DO $$ 
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'notifications'
  ) THEN
    -- Add deliveryStatus column if it doesn't exist
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_name = 'notifications' AND column_name = 'deliveryStatus'
    ) THEN
      ALTER TABLE "notifications" ADD COLUMN "deliveryStatus" TEXT DEFAULT 'delivered';
    END IF;
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════
-- ✅ MIGRATION COMPLETE
-- ═══════════════════════════════════════════════════════════════════════


-- =====================================================
-- USER PROFILES & SETTINGS MIGRATION
-- Run this in Supabase SQL Editor
-- =====================================================

-- Add additional user profile fields
ALTER TABLE users
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS gender VARCHAR(20),
ADD COLUMN IF NOT EXISTS location VARCHAR(255),
ADD COLUMN IF NOT EXISTS sports JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS skill_level VARCHAR(50),
ADD COLUMN IF NOT EXISTS total_bookings INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_hours_played DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_streak INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS longest_streak INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_activity_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create user preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Notification preferences
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT false,
  
  -- Specific notification types
  notify_booking_confirmed BOOLEAN DEFAULT true,
  notify_booking_reminder BOOLEAN DEFAULT true,
  notify_booking_cancelled BOOLEAN DEFAULT true,
  notify_friend_request BOOLEAN DEFAULT true,
  notify_friend_activity BOOLEAN DEFAULT true,
  notify_referral_signup BOOLEAN DEFAULT true,
  notify_credit_earned BOOLEAN DEFAULT true,
  notify_challenges BOOLEAN DEFAULT true,
  
  -- Privacy settings
  profile_visibility VARCHAR(20) DEFAULT 'public', -- public, friends, private
  show_activity BOOLEAN DEFAULT true,
  show_stats BOOLEAN DEFAULT true,
  
  -- Other preferences
  language VARCHAR(10) DEFAULT 'en',
  timezone VARCHAR(50) DEFAULT 'America/Los_Angeles',
  currency VARCHAR(10) DEFAULT 'USD',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Create user stats table (for caching computed stats)
CREATE TABLE IF NOT EXISTS user_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Booking stats
  total_bookings INT DEFAULT 0,
  upcoming_bookings INT DEFAULT 0,
  completed_bookings INT DEFAULT 0,
  cancelled_bookings INT DEFAULT 0,
  
  -- Time stats
  total_hours_played DECIMAL(10,2) DEFAULT 0,
  hours_this_week DECIMAL(10,2) DEFAULT 0,
  hours_this_month DECIMAL(10,2) DEFAULT 0,
  
  -- Streak stats
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_activity_date TIMESTAMPTZ,
  
  -- Social stats
  total_friends INT DEFAULT 0,
  total_reviews INT DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  
  -- Gamification stats
  total_badges INT DEFAULT 0,
  total_challenges_completed INT DEFAULT 0,
  leaderboard_rank INT,
  
  -- Financial stats
  total_spent_cents BIGINT DEFAULT 0,
  credits_balance_cents BIGINT DEFAULT 0,
  
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON user_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_users_updated_at ON users(updated_at);
CREATE INDEX IF NOT EXISTS idx_users_location ON users(location);
CREATE INDEX IF NOT EXISTS idx_users_sports ON users USING GIN(sports);

-- Create function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_stats_updated_at ON user_stats;
CREATE TRIGGER update_user_stats_updated_at
  BEFORE UPDATE ON user_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to initialize user preferences and stats on user creation
CREATE OR REPLACE FUNCTION initialize_user_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Create default preferences
  INSERT INTO user_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Create default stats
  INSERT INTO user_stats (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-initialize user data
DROP TRIGGER IF EXISTS initialize_user_data_trigger ON users;
CREATE TRIGGER initialize_user_data_trigger
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION initialize_user_data();

-- Backfill existing users
INSERT INTO user_preferences (user_id)
SELECT id FROM users
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO user_stats (user_id)
SELECT id FROM users
ON CONFLICT (user_id) DO NOTHING;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================


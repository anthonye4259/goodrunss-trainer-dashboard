-- ============================================
-- ONBOARDING DATA MIGRATION
-- Adds fields to store user onboarding data
-- ============================================

-- Add onboarding fields to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS user_type TEXT, -- 'player', 'trainer', 'both'
ADD COLUMN IF NOT EXISTS activities TEXT[], -- ['basketball', 'yoga']
ADD COLUMN IF NOT EXISTS experience_level TEXT, -- 'beginner', 'intermediate', 'advanced', 'expert'
ADD COLUMN IF NOT EXISTS age_range TEXT, -- '18-25', '26-35', '36-45', '46-55', '56+'
ADD COLUMN IF NOT EXISTS years_experience TEXT, -- '<1', '1-3', '3-5', '5-10', '10+'
ADD COLUMN IF NOT EXISTS primary_goal TEXT, -- 'exercise', 'improve', 'compete', 'socialize'
ADD COLUMN IF NOT EXISTS frequency TEXT, -- '1x', '2-3x', '4-5x', 'daily'
ADD COLUMN IF NOT EXISTS budget TEXT, -- 'free', '<25', '25-50', '50-100', '100+'
ADD COLUMN IF NOT EXISTS preferred_time TEXT, -- 'morning', 'midday', 'evening', 'flexible'
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS zip_code TEXT,
ADD COLUMN IF NOT EXISTS onboarding_complete BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMP WITH TIME ZONE;

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_users_location ON users(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_users_zip_code ON users(zip_code);
CREATE INDEX IF NOT EXISTS idx_users_onboarding_complete ON users(onboarding_complete);
CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);
CREATE INDEX IF NOT EXISTS idx_users_primary_goal ON users(primary_goal);
CREATE INDEX IF NOT EXISTS idx_users_experience_level ON users(experience_level);

-- Create trainers table (if not exists)
CREATE TABLE IF NOT EXISTS trainers (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL UNIQUE,
  years_experience TEXT,
  certifications TEXT[],
  session_types TEXT[], -- ['private', 'semi-private', 'small-group']
  pricing JSONB, -- {"private": 80, "semi-private": 50}
  availability TEXT[], -- ['Weekday Mornings', 'Weekend Afternoons']
  current_clients TEXT, -- '0-5', '5-10', etc.
  desired_clients TEXT, -- '10-20', '30+', etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT trainers_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_trainers_user_id ON trainers(user_id);
CREATE INDEX IF NOT EXISTS idx_trainers_pricing ON trainers USING GIN (pricing);

-- Comments for documentation
COMMENT ON COLUMN users.user_type IS 'Type of user: player, trainer, or both';
COMMENT ON COLUMN users.activities IS 'Sports/activities user is interested in';
COMMENT ON COLUMN users.experience_level IS 'Overall experience level';
COMMENT ON COLUMN users.age_range IS 'Age range for demographic targeting';
COMMENT ON COLUMN users.primary_goal IS 'Main goal (for players): exercise, improve, compete, socialize';
COMMENT ON COLUMN users.frequency IS 'How often user plays/practices';
COMMENT ON COLUMN users.budget IS 'Budget range for coaching/training';
COMMENT ON COLUMN users.preferred_time IS 'Preferred time of day for activities';
COMMENT ON COLUMN users.latitude IS 'User location latitude for proximity search';
COMMENT ON COLUMN users.longitude IS 'User location longitude for proximity search';
COMMENT ON COLUMN users.onboarding_complete IS 'Whether user completed onboarding flow';
COMMENT ON COLUMN users.onboarding_completed_at IS 'When onboarding was completed';

COMMENT ON TABLE trainers IS 'Trainer-specific profile data from onboarding';
COMMENT ON COLUMN trainers.pricing IS 'JSON object with pricing for different session types';
COMMENT ON COLUMN trainers.availability IS 'Available time slots (e.g., "Weekday Mornings")';

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Onboarding data migration completed successfully!';
  RAISE NOTICE 'Added % columns to users table', (
    SELECT count(*) 
    FROM information_schema.columns 
    WHERE table_name = 'users' 
    AND column_name IN (
      'user_type', 'activities', 'experience_level', 'age_range', 
      'years_experience', 'primary_goal', 'frequency', 'budget', 
      'preferred_time', 'latitude', 'longitude', 'zip_code',
      'onboarding_complete', 'onboarding_completed_at'
    )
  );
  RAISE NOTICE 'Trainers table ready for use';
END $$;


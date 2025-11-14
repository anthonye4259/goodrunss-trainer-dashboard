-- ============================================
-- MISSING FEATURES MIGRATION
-- Date: November 9, 2024
-- Purpose: Add tables for Matches, Ratings, Favorites, and Wearables
-- ============================================

-- ============================================
-- 1. PLAYER RATINGS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS player_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  sport VARCHAR(50) NOT NULL,
  rating DECIMAL(4, 2) NOT NULL DEFAULT 0,
  matches_played INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  UNIQUE(user_id, sport)
);

CREATE INDEX IF NOT EXISTS idx_player_ratings_user_id ON player_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_player_ratings_sport ON player_ratings(sport);

-- ============================================
-- 2. MATCHES & MATCH REQUESTS TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS match_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  venue_id UUID REFERENCES facilities(id) ON DELETE SET NULL,
  preferred_date TIMESTAMP,
  preferred_time VARCHAR(50),
  message TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, accepted, declined, cancelled
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_match_requests_sender ON match_requests(sender_id);
CREATE INDEX IF NOT EXISTS idx_match_requests_recipient ON match_requests(recipient_id);
CREATE INDEX IF NOT EXISTS idx_match_requests_status ON match_requests(status);

CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player1_id UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  player2_id UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  venue_id UUID REFERENCES facilities(id) ON DELETE SET NULL,
  sport VARCHAR(50),
  played_at TIMESTAMP NOT NULL,
  result TEXT,
  score VARCHAR(100),
  rating INTEGER, -- 1-5 rating for the match
  status VARCHAR(20) NOT NULL DEFAULT 'scheduled', -- scheduled, completed, cancelled
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_matches_player1 ON matches(player1_id);
CREATE INDEX IF NOT EXISTS idx_matches_player2 ON matches(player2_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_played_at ON matches(played_at DESC);

-- ============================================
-- 3. FAVORITES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  trainer_id UUID REFERENCES "User"(id) ON DELETE CASCADE,
  facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
  favorite_type VARCHAR(20) NOT NULL, -- 'trainer' or 'venue'
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  UNIQUE(user_id, trainer_id, facility_id),
  CHECK (
    (favorite_type = 'trainer' AND trainer_id IS NOT NULL AND facility_id IS NULL) OR
    (favorite_type = 'venue' AND facility_id IS NOT NULL AND trainer_id IS NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_trainer ON favorites(trainer_id);
CREATE INDEX IF NOT EXISTS idx_favorites_facility ON favorites(facility_id);
CREATE INDEX IF NOT EXISTS idx_favorites_type ON favorites(favorite_type);

-- ============================================
-- 4. WEARABLES TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS wearable_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  device_type VARCHAR(50) NOT NULL, -- apple_watch, whoop, garmin, fitbit, oura
  is_connected BOOLEAN NOT NULL DEFAULT true,
  connected_at TIMESTAMP,
  last_sync TIMESTAMP,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  UNIQUE(user_id, device_type)
);

CREATE INDEX IF NOT EXISTS idx_wearable_connections_user ON wearable_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_wearable_connections_device ON wearable_connections(device_type);

CREATE TABLE IF NOT EXISTS wearable_sync_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  device_type VARCHAR(50) NOT NULL,
  sync_data JSONB NOT NULL,
  synced_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wearable_sync_user ON wearable_sync_data(user_id);
CREATE INDEX IF NOT EXISTS idx_wearable_sync_device ON wearable_sync_data(device_type);
CREATE INDEX IF NOT EXISTS idx_wearable_sync_date ON wearable_sync_data(synced_at DESC);

-- ============================================
-- 5. ADD METADATA COLUMN TO USER (if not exists)
-- ============================================

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'User' AND column_name = 'metadata'
  ) THEN
    ALTER TABLE "User" ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- ============================================
-- 6. ADD BIO COLUMN TO USER (if not exists)
-- ============================================

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'User' AND column_name = 'bio'
  ) THEN
    ALTER TABLE "User" ADD COLUMN bio TEXT;
  END IF;
END $$;

-- ============================================
-- 7. ADD PROFILE_IMAGE COLUMN TO USER (if not exists)
-- ============================================

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'User' AND column_name = 'profile_image'
  ) THEN
    ALTER TABLE "User" ADD COLUMN profile_image TEXT;
  END IF;
END $$;

-- ============================================
-- COMPLETE!
-- ============================================

-- Summary: Added tables for
-- - player_ratings (sport-specific ratings)
-- - match_requests (player vs player match requests)
-- - matches (completed matches)
-- - favorites (trainers & venues)
-- - wearable_connections (device connections)
-- - wearable_sync_data (sync history)
-- - User metadata, bio, profile_image columns

SELECT 'Migration complete! All missing feature tables created.' as status;


-- =====================================================
-- FIND PARTNERS / PLAYER MATCHING MIGRATION
-- Run this in Supabase SQL Editor
-- =====================================================

-- Add availability fields to users
ALTER TABLE users
ADD COLUMN IF NOT EXISTS availability JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS preferred_times TEXT[],
ADD COLUMN IF NOT EXISTS preferred_days TEXT[];

-- Create match requests table
CREATE TABLE IF NOT EXISTS match_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sport VARCHAR(50) NOT NULL,
  message TEXT,
  proposed_time TIMESTAMPTZ,
  proposed_facility_id UUID REFERENCES facilities(id),
  status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, declined, cancelled
  created_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  
  CHECK (from_user_id != to_user_id)
);

-- Create player matches table (tracks who played together)
CREATE TABLE IF NOT EXISTS player_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  player2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  sport VARCHAR(50),
  played_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CHECK (player1_id != player2_id)
);

-- Create player ratings table (rate your match partners)
CREATE TABLE IF NOT EXISTS player_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rater_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rated_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  match_id UUID REFERENCES player_matches(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  skill_rating INT CHECK (skill_rating >= 1 AND skill_rating <= 5),
  sportsmanship_rating INT CHECK (sportsmanship_rating >= 1 AND sportsmanship <= 5),
  reliability_rating INT CHECK (reliability_rating >= 1 AND reliability_rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(rater_id, rated_user_id, match_id),
  CHECK (rater_id != rated_user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_sports ON users USING GIN(sports);
CREATE INDEX IF NOT EXISTS idx_users_skill_level ON users(skill_level);
CREATE INDEX IF NOT EXISTS idx_users_location ON users(location);
CREATE INDEX IF NOT EXISTS idx_match_requests_from_user ON match_requests(from_user_id);
CREATE INDEX IF NOT EXISTS idx_match_requests_to_user ON match_requests(to_user_id);
CREATE INDEX IF NOT EXISTS idx_match_requests_status ON match_requests(status);
CREATE INDEX IF NOT EXISTS idx_player_matches_player1 ON player_matches(player1_id);
CREATE INDEX IF NOT EXISTS idx_player_matches_player2 ON player_matches(player2_id);
CREATE INDEX IF NOT EXISTS idx_player_matches_played_at ON player_matches(played_at DESC);
CREATE INDEX IF NOT EXISTS idx_player_ratings_rated_user ON player_ratings(rated_user_id);

-- Function to update player rating when new rating is added
CREATE OR REPLACE FUNCTION update_player_rating()
RETURNS TRIGGER AS $$
DECLARE
  avg_rating DECIMAL(3,2);
  total_ratings INT;
BEGIN
  -- Calculate new average rating
  SELECT 
    ROUND(AVG(rating)::numeric, 2),
    COUNT(*)
  INTO avg_rating, total_ratings
  FROM player_ratings
  WHERE rated_user_id = NEW.rated_user_id;
  
  -- Update user's rating
  UPDATE users
  SET 
    rating = avg_rating,
    total_reviews = total_ratings
  WHERE id = NEW.rated_user_id;
  
  -- Update user stats
  UPDATE user_stats
  SET 
    average_rating = avg_rating,
    total_reviews = total_ratings
  WHERE user_id = NEW.rated_user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_player_rating_trigger ON player_ratings;
CREATE TRIGGER update_player_rating_trigger
  AFTER INSERT OR UPDATE ON player_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_player_rating();

-- Function to auto-accept match request and create friendship
CREATE OR REPLACE FUNCTION process_match_request_acceptance()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'accepted' AND (OLD IS NULL OR OLD.status = 'pending') THEN
    -- Create friendship if doesn't exist
    INSERT INTO friendships (user_id, friend_id, status, accepted_at)
    VALUES (NEW.from_user_id, NEW.to_user_id, 'accepted', NOW())
    ON CONFLICT (user_id, friend_id) DO UPDATE
    SET status = 'accepted', accepted_at = NOW()
    WHERE friendships.status = 'pending';
    
    -- Send notification
    PERFORM send_notification(
      NEW.from_user_id,
      'match_request_accepted',
      'Match Request Accepted!',
      'Your match request was accepted. Time to play!',
      jsonb_build_object(
        'match_request_id', NEW.id,
        'partner_id', NEW.to_user_id
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS process_match_request_acceptance_trigger ON match_requests;
CREATE TRIGGER process_match_request_acceptance_trigger
  AFTER UPDATE ON match_requests
  FOR EACH ROW
  EXECUTE FUNCTION process_match_request_acceptance();

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================


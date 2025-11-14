-- =====================================================
-- CHALLENGES & GAMIFICATION MIGRATION
-- Run this in Supabase SQL Editor
-- =====================================================

-- Create challenges table
CREATE TABLE IF NOT EXISTS challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL, -- steps, bookings, streak, hours, social
  goal_value INT NOT NULL,
  goal_unit VARCHAR(50), -- steps, bookings, days, hours
  reward_credits INT DEFAULT 0,
  badge_name VARCHAR(100),
  badge_icon TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user challenge progress table
CREATE TABLE IF NOT EXISTS user_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  current_value INT DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, challenge_id)
);

-- Create badges table
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  tier VARCHAR(20) DEFAULT 'bronze', -- bronze, silver, gold, platinum
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user badges table
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, badge_id)
);

-- Create leaderboard table (cached rankings)
CREATE TABLE IF NOT EXISTS leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  leaderboard_type VARCHAR(50) NOT NULL, -- global, friends, facility
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entity_id UUID, -- facility_id for facility leaderboards
  rank INT NOT NULL,
  score INT NOT NULL,
  period VARCHAR(20) NOT NULL, -- week, month, all_time
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(leaderboard_type, user_id, entity_id, period)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_challenges_is_active ON challenges(is_active);
CREATE INDEX IF NOT EXISTS idx_challenges_dates ON challenges(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_user_challenges_user_id ON user_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_challenges_challenge_id ON user_challenges(challenge_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_type_period ON leaderboard(leaderboard_type, period);
CREATE INDEX IF NOT EXISTS idx_leaderboard_rank ON leaderboard(rank);

-- Function to award badge to user
CREATE OR REPLACE FUNCTION award_badge(
  p_user_id UUID,
  p_badge_name VARCHAR(100)
) RETURNS UUID AS $$
DECLARE
  v_badge_id UUID;
  v_user_badge_id UUID;
BEGIN
  -- Get badge ID
  SELECT id INTO v_badge_id
  FROM badges
  WHERE name = p_badge_name;
  
  IF v_badge_id IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Award badge (if not already awarded)
  INSERT INTO user_badges (user_id, badge_id)
  VALUES (p_user_id, v_badge_id)
  ON CONFLICT (user_id, badge_id) DO NOTHING
  RETURNING id INTO v_user_badge_id;
  
  -- Update user stats
  IF v_user_badge_id IS NOT NULL THEN
    UPDATE user_stats
    SET total_badges = total_badges + 1
    WHERE user_id = p_user_id;
    
    -- Send notification
    PERFORM send_notification(
      p_user_id,
      'badge_earned',
      'New Badge Earned!',
      'You earned the ' || p_badge_name || ' badge!',
      jsonb_build_object('badge_name', p_badge_name)
    );
  END IF;
  
  RETURN v_user_badge_id;
END;
$$ LANGUAGE plpgsql;

-- Function to check and complete challenges
CREATE OR REPLACE FUNCTION check_challenge_completion()
RETURNS TRIGGER AS $$
DECLARE
  challenge_record RECORD;
BEGIN
  -- Check if challenge is completed
  SELECT * INTO challenge_record
  FROM challenges
  WHERE id = NEW.challenge_id;
  
  IF NEW.current_value >= challenge_record.goal_value AND NOT NEW.is_completed THEN
    -- Mark as completed
    NEW.is_completed = true;
    NEW.completed_at = NOW();
    
    -- Award credits
    IF challenge_record.reward_credits > 0 THEN
      INSERT INTO referral_credits (user_id, amount_cents, transaction_type, description)
      VALUES (
        NEW.user_id,
        challenge_record.reward_credits * 100,
        'earned',
        'Completed challenge: ' || challenge_record.name
      );
    END IF;
    
    -- Award badge
    IF challenge_record.badge_name IS NOT NULL THEN
      PERFORM award_badge(NEW.user_id, challenge_record.badge_name);
    END IF;
    
    -- Update user stats
    UPDATE user_stats
    SET total_challenges_completed = total_challenges_completed + 1
    WHERE user_id = NEW.user_id;
    
    -- Send notification
    PERFORM send_notification(
      NEW.user_id,
      'challenge_completed',
      'Challenge Completed!',
      'You completed the ' || challenge_record.name || ' challenge!',
      jsonb_build_object('challenge_id', NEW.challenge_id)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS check_challenge_completion_trigger ON user_challenges;
CREATE TRIGGER check_challenge_completion_trigger
  BEFORE UPDATE ON user_challenges
  FOR EACH ROW
  EXECUTE FUNCTION check_challenge_completion();

-- Insert some default badges
INSERT INTO badges (name, description, icon, tier) VALUES
  ('First Booking', 'Made your first booking', '🎾', 'bronze'),
  ('5 Bookings', 'Completed 5 bookings', '🏆', 'bronze'),
  ('10 Bookings', 'Completed 10 bookings', '🥇', 'silver'),
  ('50 Bookings', 'Completed 50 bookings', '💎', 'gold'),
  ('100 Bookings', 'Completed 100 bookings', '👑', 'platinum'),
  ('Early Bird', 'Booked before 8 AM', '🌅', 'bronze'),
  ('Night Owl', 'Booked after 8 PM', '🌙', 'bronze'),
  ('Social Butterfly', 'Invited 10 friends', '🦋', 'silver'),
  ('Streak Master', '30-day streak', '🔥', 'gold')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================


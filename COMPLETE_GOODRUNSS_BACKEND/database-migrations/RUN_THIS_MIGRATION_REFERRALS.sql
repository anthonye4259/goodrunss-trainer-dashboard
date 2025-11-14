-- Referral System Database Schema

-- 1. User referrals table
CREATE TABLE IF NOT EXISTS user_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  referral_code TEXT UNIQUE NOT NULL,
  referred_by TEXT,  -- User ID of referrer
  total_invites INTEGER DEFAULT 0,
  successful_signups INTEGER DEFAULT 0,
  total_credits_earned DECIMAL(10,2) DEFAULT 0,
  tier TEXT DEFAULT 'Standard',  -- Standard, Bronze, Silver, Gold, Platinum
  tier_multiplier DECIMAL(3,2) DEFAULT 1.00,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Referral history/events table
CREATE TABLE IF NOT EXISTS referral_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id TEXT NOT NULL,  -- User who referred
  referred_user_id TEXT NOT NULL,  -- User who was referred
  event_type TEXT NOT NULL,  -- 'signup', 'first_booking', 'premium_upgrade'
  credits_earned DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'pending',  -- 'pending', 'completed', 'credited'
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Referral rewards/credits table
CREATE TABLE IF NOT EXISTS referral_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  type TEXT NOT NULL,  -- 'earned', 'redeemed', 'expired'
  source TEXT NOT NULL,  -- 'player_referral', 'trainer_referral', 'premium_referral'
  description TEXT,
  booking_id TEXT,  -- If redeemed for booking
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Referral tiers configuration
CREATE TABLE IF NOT EXISTS referral_tiers (
  tier TEXT PRIMARY KEY,
  min_referrals INTEGER NOT NULL,
  multiplier DECIMAL(3,2) NOT NULL,
  badge_color TEXT,
  benefits JSONB
);

-- Insert default tier configuration
INSERT INTO referral_tiers (tier, min_referrals, multiplier, badge_color, benefits)
VALUES 
  ('Standard', 0, 1.00, 'gray', '{"description": "Start earning credits"}'),
  ('Bronze', 5, 1.25, 'bronze', '{"description": "25% bonus on all referrals"}'),
  ('Silver', 15, 1.50, 'silver', '{"description": "50% bonus + priority support"}'),
  ('Gold', 50, 2.00, 'gold', '{"description": "2x credits + exclusive perks"}'),
  ('Platinum', 100, 2.50, 'platinum', '{"description": "2.5x credits + VIP access"}')
ON CONFLICT (tier) DO NOTHING;

-- 5. Referral shares tracking (for analytics)
CREATE TABLE IF NOT EXISTS referral_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  platform TEXT NOT NULL,  -- 'instagram', 'twitter', 'whatsapp', 'generic'
  shared_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_referrals_user_id ON user_referrals(user_id);
CREATE INDEX IF NOT EXISTS idx_user_referrals_code ON user_referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_user_referrals_referred_by ON user_referrals(referred_by);
CREATE INDEX IF NOT EXISTS idx_referral_events_referrer ON referral_events(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_events_referred ON referral_events(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_referral_credits_user ON referral_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_shares_user ON referral_shares(user_id);

-- Function to update tier based on successful referrals
CREATE OR REPLACE FUNCTION update_referral_tier()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE user_referrals
  SET 
    tier = CASE
      WHEN NEW.successful_signups >= 100 THEN 'Platinum'
      WHEN NEW.successful_signups >= 50 THEN 'Gold'
      WHEN NEW.successful_signups >= 15 THEN 'Silver'
      WHEN NEW.successful_signups >= 5 THEN 'Bronze'
      ELSE 'Standard'
    END,
    tier_multiplier = CASE
      WHEN NEW.successful_signups >= 100 THEN 2.50
      WHEN NEW.successful_signups >= 50 THEN 2.00
      WHEN NEW.successful_signups >= 15 THEN 1.50
      WHEN NEW.successful_signups >= 5 THEN 1.25
      ELSE 1.00
    END,
    updated_at = NOW()
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update tier
DROP TRIGGER IF EXISTS trigger_update_tier ON user_referrals;
CREATE TRIGGER trigger_update_tier
  AFTER UPDATE OF successful_signups ON user_referrals
  FOR EACH ROW
  EXECUTE FUNCTION update_referral_tier();

-- Verify tables created
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('user_referrals', 'referral_events', 'referral_credits', 'referral_tiers', 'referral_shares')
ORDER BY table_name;


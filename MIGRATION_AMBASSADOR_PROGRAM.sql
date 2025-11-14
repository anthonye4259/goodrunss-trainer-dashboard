-- ============================================
-- 🌟 GOODRUNSS AMBASSADOR PROGRAM
-- ============================================
-- Three-tier community program:
-- 1. Court Captains (facility reporters)
-- 2. UGC Creators (content creators)
-- 3. Ambassadors (brand representatives)
-- ============================================

-- ============================================
-- 1. PROGRAM ROLES & TIERS
-- ============================================

CREATE TABLE program_roles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon TEXT,
  requirements TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE role_tiers (
  id TEXT PRIMARY KEY,
  role_id TEXT NOT NULL REFERENCES program_roles(id),
  tier_level INTEGER NOT NULL, -- 1, 2, 3
  tier_name TEXT NOT NULL, -- Bronze, Silver, Gold
  requirements JSONB NOT NULL,
  perks JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(role_id, tier_level)
);

-- ============================================
-- 2. APPLICATIONS
-- ============================================

CREATE TABLE ambassador_applications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  role_id TEXT NOT NULL REFERENCES program_roles(id),
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected
  
  -- Application data
  application_data JSONB NOT NULL,
  motivation TEXT,
  social_links JSONB,
  portfolio_url TEXT,
  referral_code TEXT, -- How they heard about program
  
  -- Review
  reviewed_by TEXT,
  reviewed_at TIMESTAMP,
  rejection_reason TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_applications_user ON ambassador_applications(user_id);
CREATE INDEX idx_applications_role ON ambassador_applications(role_id);
CREATE INDEX idx_applications_status ON ambassador_applications(status);

-- ============================================
-- 3. ACTIVE MEMBERS
-- ============================================

CREATE TABLE program_members (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  role_id TEXT NOT NULL REFERENCES program_roles(id),
  tier_id TEXT REFERENCES role_tiers(id),
  
  -- Status
  status TEXT NOT NULL DEFAULT 'active', -- active, paused, suspended, removed
  
  -- Stats
  points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  tier_level INTEGER DEFAULT 1,
  
  -- Dates
  joined_at TIMESTAMP DEFAULT NOW(),
  tier_updated_at TIMESTAMP,
  last_active_at TIMESTAMP,
  
  UNIQUE(user_id, role_id)
);

CREATE INDEX idx_members_user ON program_members(user_id);
CREATE INDEX idx_members_role ON program_members(role_id);
CREATE INDEX idx_members_status ON program_members(status);

-- ============================================
-- 4. COURT CAPTAINS (Facility Ownership)
-- ============================================

CREATE TABLE court_captains (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  member_id TEXT NOT NULL REFERENCES program_members(id),
  
  -- Assigned facilities
  facility_id TEXT NOT NULL,
  sport TEXT NOT NULL,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'active', -- active, inactive
  
  -- Stats
  total_reports INTEGER DEFAULT 0,
  quality_score DECIMAL(3,2) DEFAULT 0.00, -- 0.00 to 5.00
  response_time_avg INTEGER, -- minutes
  consistency_score DECIMAL(3,2) DEFAULT 0.00, -- 0.00 to 5.00
  
  -- Perks
  priority_booking BOOLEAN DEFAULT true,
  free_bookings_per_month INTEGER DEFAULT 0,
  discount_percentage INTEGER DEFAULT 0,
  
  -- Dates
  assigned_at TIMESTAMP DEFAULT NOW(),
  last_report_at TIMESTAMP,
  
  UNIQUE(user_id, facility_id)
);

CREATE INDEX idx_captains_user ON court_captains(user_id);
CREATE INDEX idx_captains_facility ON court_captains(facility_id);
CREATE INDEX idx_captains_status ON court_captains(status);

-- ============================================
-- 5. UGC CREATORS (Content Submission)
-- ============================================

CREATE TABLE ugc_creators (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  member_id TEXT NOT NULL REFERENCES program_members(id),
  
  -- Creator profile
  creator_name TEXT,
  bio TEXT,
  social_handles JSONB,
  content_categories TEXT[], -- drills, reviews, tips, vlogs, etc.
  
  -- Stats
  total_content INTEGER DEFAULT 0,
  total_views INTEGER DEFAULT 0,
  total_likes INTEGER DEFAULT 0,
  total_shares INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,2) DEFAULT 0.00, -- percentage
  
  -- Earnings
  total_earnings DECIMAL(10,2) DEFAULT 0.00,
  commission_rate DECIMAL(4,2) DEFAULT 5.00, -- 5% default
  
  -- Perks
  featured_creator BOOLEAN DEFAULT false,
  verified_creator BOOLEAN DEFAULT false,
  pro_subscription BOOLEAN DEFAULT false,
  
  -- Dates
  joined_at TIMESTAMP DEFAULT NOW(),
  last_post_at TIMESTAMP,
  
  UNIQUE(user_id)
);

CREATE INDEX idx_ugc_user ON ugc_creators(user_id);
CREATE INDEX idx_ugc_featured ON ugc_creators(featured_creator);
CREATE INDEX idx_ugc_verified ON ugc_creators(verified_creator);

CREATE TABLE ugc_content (
  id TEXT PRIMARY KEY,
  creator_id TEXT NOT NULL REFERENCES ugc_creators(id),
  
  -- Content
  content_type TEXT NOT NULL, -- video, photo, review, drill, tip
  title TEXT NOT NULL,
  description TEXT,
  content_url TEXT NOT NULL,
  thumbnail_url TEXT,
  
  -- Metadata
  sport TEXT,
  skill_level TEXT,
  duration INTEGER, -- seconds (for videos)
  tags TEXT[],
  
  -- Moderation
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected, removed
  moderated_by TEXT,
  moderated_at TIMESTAMP,
  rejection_reason TEXT,
  
  -- Engagement
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  
  -- Monetization
  bookings_generated INTEGER DEFAULT 0,
  revenue_generated DECIMAL(10,2) DEFAULT 0.00,
  creator_earnings DECIMAL(10,2) DEFAULT 0.00,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  published_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_content_creator ON ugc_content(creator_id);
CREATE INDEX idx_content_status ON ugc_content(status);
CREATE INDEX idx_content_type ON ugc_content(content_type);
CREATE INDEX idx_content_sport ON ugc_content(sport);

-- ============================================
-- 6. AMBASSADORS (Referrals & Events)
-- ============================================

CREATE TABLE ambassadors (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  member_id TEXT NOT NULL REFERENCES program_members(id),
  
  -- Ambassador profile
  ambassador_code TEXT NOT NULL UNIQUE,
  territory TEXT, -- city, region
  focus_sports TEXT[],
  
  -- Stats
  total_referrals INTEGER DEFAULT 0,
  active_referrals INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0.00,
  total_events_hosted INTEGER DEFAULT 0,
  total_attendees INTEGER DEFAULT 0,
  
  -- Earnings
  total_earnings DECIMAL(10,2) DEFAULT 0.00,
  commission_rate DECIMAL(4,2) DEFAULT 10.00, -- 10% default
  
  -- Perks
  swag_tier TEXT DEFAULT 'basic', -- basic, premium, elite
  priority_support BOOLEAN DEFAULT true,
  event_budget DECIMAL(10,2) DEFAULT 0.00,
  
  -- Dates
  joined_at TIMESTAMP DEFAULT NOW(),
  last_referral_at TIMESTAMP,
  last_event_at TIMESTAMP,
  
  UNIQUE(user_id)
);

CREATE INDEX idx_ambassadors_user ON ambassadors(user_id);
CREATE INDEX idx_ambassadors_code ON ambassadors(ambassador_code);
CREATE INDEX idx_ambassadors_territory ON ambassadors(territory);

CREATE TABLE ambassador_referrals (
  id TEXT PRIMARY KEY,
  ambassador_id TEXT NOT NULL REFERENCES ambassadors(id),
  referred_user_id TEXT NOT NULL,
  
  -- Referral details
  referral_code TEXT NOT NULL,
  referral_source TEXT, -- social, event, direct, etc.
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending', -- pending, converted, churned
  converted_at TIMESTAMP,
  
  -- Value
  lifetime_value DECIMAL(10,2) DEFAULT 0.00,
  commission_earned DECIMAL(10,2) DEFAULT 0.00,
  commission_paid BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_referrals_ambassador ON ambassador_referrals(ambassador_id);
CREATE INDEX idx_referrals_user ON ambassador_referrals(referred_user_id);
CREATE INDEX idx_referrals_code ON ambassador_referrals(referral_code);

CREATE TABLE ambassador_events (
  id TEXT PRIMARY KEY,
  ambassador_id TEXT NOT NULL REFERENCES ambassadors(id),
  
  -- Event details
  event_name TEXT NOT NULL,
  event_type TEXT NOT NULL, -- clinic, tournament, meetup, demo
  description TEXT,
  sport TEXT,
  
  -- Location & time
  facility_id TEXT,
  location_name TEXT NOT NULL,
  event_date TIMESTAMP NOT NULL,
  duration INTEGER, -- minutes
  
  -- Capacity
  max_attendees INTEGER,
  registered_attendees INTEGER DEFAULT 0,
  actual_attendees INTEGER DEFAULT 0,
  
  -- Budget
  budget_allocated DECIMAL(10,2) DEFAULT 0.00,
  budget_spent DECIMAL(10,2) DEFAULT 0.00,
  
  -- Results
  new_signups INTEGER DEFAULT 0,
  bookings_generated INTEGER DEFAULT 0,
  revenue_generated DECIMAL(10,2) DEFAULT 0.00,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'planned', -- planned, active, completed, cancelled
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_events_ambassador ON ambassador_events(ambassador_id);
CREATE INDEX idx_events_date ON ambassador_events(event_date);
CREATE INDEX idx_events_status ON ambassador_events(status);

-- ============================================
-- 7. REWARDS & PAYOUTS
-- ============================================

CREATE TABLE program_rewards (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  member_id TEXT REFERENCES program_members(id),
  role_id TEXT NOT NULL REFERENCES program_roles(id),
  
  -- Reward details
  reward_type TEXT NOT NULL, -- commission, bonus, prize, swag
  amount DECIMAL(10,2) DEFAULT 0.00,
  currency TEXT DEFAULT 'USD',
  
  -- Description
  description TEXT NOT NULL,
  related_to TEXT, -- referral_id, content_id, event_id, etc.
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, paid, cancelled
  approved_by TEXT,
  approved_at TIMESTAMP,
  paid_at TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_rewards_user ON program_rewards(user_id);
CREATE INDEX idx_rewards_member ON program_rewards(member_id);
CREATE INDEX idx_rewards_status ON program_rewards(status);

-- ============================================
-- 8. ACTIVITY TRACKING
-- ============================================

CREATE TABLE program_activity (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  member_id TEXT REFERENCES program_members(id),
  role_id TEXT NOT NULL REFERENCES program_roles(id),
  
  -- Activity
  activity_type TEXT NOT NULL, -- report_submitted, content_posted, referral_made, event_hosted, etc.
  activity_data JSONB,
  
  -- Points
  points_earned INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_activity_user ON program_activity(user_id);
CREATE INDEX idx_activity_member ON program_activity(member_id);
CREATE INDEX idx_activity_type ON program_activity(activity_type);
CREATE INDEX idx_activity_date ON program_activity(created_at);

-- ============================================
-- SEED DATA
-- ============================================

-- Program Roles
INSERT INTO program_roles (id, name, description, icon, requirements) VALUES
('court-captain', 'Court Captain', 'Monitor and report on facility conditions. Own specific courts and earn rewards for consistent reporting.', '🎾', 'Submit 20+ facility reports with 4.5+ quality score'),
('ugc-creator', 'UGC Creator', 'Create engaging content (videos, photos, reviews). Get featured and earn commission on bookings.', '📸', 'Submit 5+ pieces of content with 1000+ total views'),
('ambassador', 'Ambassador', 'Represent GoodRunss in your community. Host events and refer new users.', '🌟', 'Refer 10+ users with 50%+ conversion rate');

-- Court Captain Tiers
INSERT INTO role_tiers (id, role_id, tier_level, tier_name, requirements, perks) VALUES
('captain-bronze', 'court-captain', 1, 'Bronze Captain', 
  '{"min_reports": 20, "min_quality_score": 4.0, "min_facilities": 1}'::jsonb,
  '{"priority_booking": true, "free_bookings": 1, "discount_percent": 10}'::jsonb),
('captain-silver', 'court-captain', 2, 'Silver Captain',
  '{"min_reports": 50, "min_quality_score": 4.5, "min_facilities": 3}'::jsonb,
  '{"priority_booking": true, "free_bookings": 3, "discount_percent": 20}'::jsonb),
('captain-gold', 'court-captain', 3, 'Gold Captain',
  '{"min_reports": 100, "min_quality_score": 4.8, "min_facilities": 5}'::jsonb,
  '{"priority_booking": true, "free_bookings": 5, "discount_percent": 30}'::jsonb);

-- UGC Creator Tiers
INSERT INTO role_tiers (id, role_id, tier_level, tier_name, requirements, perks) VALUES
('creator-bronze', 'ugc-creator', 1, 'Bronze Creator',
  '{"min_content": 5, "min_views": 1000, "min_engagement": 5.0}'::jsonb,
  '{"commission_rate": 5, "pro_subscription": false, "featured": false}'::jsonb),
('creator-silver', 'ugc-creator', 2, 'Silver Creator',
  '{"min_content": 15, "min_views": 5000, "min_engagement": 7.5}'::jsonb,
  '{"commission_rate": 10, "pro_subscription": true, "featured": true}'::jsonb),
('creator-gold', 'ugc-creator', 3, 'Gold Creator',
  '{"min_content": 30, "min_views": 15000, "min_engagement": 10.0}'::jsonb,
  '{"commission_rate": 15, "pro_subscription": true, "featured": true, "verified": true}'::jsonb);

-- Ambassador Tiers
INSERT INTO role_tiers (id, role_id, tier_level, tier_name, requirements, perks) VALUES
('ambassador-bronze', 'ambassador', 1, 'Bronze Ambassador',
  '{"min_referrals": 10, "min_conversion": 30.0, "min_events": 0}'::jsonb,
  '{"commission_rate": 10, "swag_tier": "basic", "event_budget": 0}'::jsonb),
('ambassador-silver', 'ambassador', 2, 'Silver Ambassador',
  '{"min_referrals": 25, "min_conversion": 40.0, "min_events": 2}'::jsonb,
  '{"commission_rate": 15, "swag_tier": "premium", "event_budget": 200}'::jsonb),
('ambassador-gold', 'ambassador', 3, 'Gold Ambassador',
  '{"min_referrals": 50, "min_conversion": 50.0, "min_events": 5}'::jsonb,
  '{"commission_rate": 20, "swag_tier": "elite", "event_budget": 500}'::jsonb);

-- Success message
SELECT '✅ Ambassador Program Database Created!' as status,
       (SELECT COUNT(*) FROM program_roles) as roles,
       (SELECT COUNT(*) FROM role_tiers) as tiers;


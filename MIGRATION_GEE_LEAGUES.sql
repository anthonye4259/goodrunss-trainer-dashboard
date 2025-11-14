-- ============================================
-- 🏆 GEE LEAGUES - Adult Recreational Leagues
-- ============================================
-- Find and join local sports leagues
-- ============================================

-- ============================================
-- 1. LEAGUES
-- ============================================

CREATE TABLE leagues (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  sport TEXT NOT NULL, -- tennis, basketball, golf, pickleball
  
  -- Location
  facility_id TEXT, -- Link to facilities table
  venue_name TEXT,
  address TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  country TEXT DEFAULT 'US',
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  geo_point GEOGRAPHY(POINT, 4326),
  
  -- Organization
  organizer_name TEXT,
  organizer_email TEXT,
  organizer_phone TEXT,
  website TEXT,
  registration_url TEXT,
  
  -- Details
  description TEXT,
  skill_levels TEXT[], -- beginner, intermediate, advanced, open
  age_groups TEXT[], -- 18+, 21+, 30+, 40+, 50+, 60+
  format TEXT, -- singles, doubles, teams, individual
  
  -- Schedule
  season_type TEXT, -- spring, summer, fall, winter, year-round
  day_of_week TEXT[], -- monday, tuesday, etc.
  start_time TIME,
  duration_minutes INTEGER,
  
  -- Registration
  registration_status TEXT DEFAULT 'open', -- open, closed, full, waitlist
  registration_fee DECIMAL(10, 2),
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  
  -- Features
  features JSONB, -- {"referees": true, "prizes": true, "playoffs": true}
  
  -- Status
  is_verified BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  source TEXT, -- user_submitted, admin_added, api_import
  added_by TEXT, -- user_id who added it
  views INTEGER DEFAULT 0,
  signups INTEGER DEFAULT 0,
  rating DECIMAL(3, 2) DEFAULT 0.00,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_leagues_sport ON leagues(sport);
CREATE INDEX idx_leagues_city ON leagues(city);
CREATE INDEX idx_leagues_status ON leagues(registration_status);
CREATE INDEX idx_leagues_active ON leagues(is_active);
CREATE INDEX idx_leagues_geo ON leagues USING GIST(geo_point);

-- ============================================
-- 2. LEAGUE SEASONS
-- ============================================

CREATE TABLE league_seasons (
  id TEXT PRIMARY KEY,
  league_id TEXT NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  
  -- Season info
  season_name TEXT NOT NULL, -- "Spring 2025", "Summer 2025"
  season_number INTEGER, -- 1, 2, 3 for tracking
  
  -- Dates
  registration_opens TIMESTAMP,
  registration_closes TIMESTAMP,
  season_starts DATE NOT NULL,
  season_ends DATE NOT NULL,
  
  -- Registration
  registration_fee DECIMAL(10, 2),
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  waitlist_count INTEGER DEFAULT 0,
  
  -- Status
  status TEXT DEFAULT 'upcoming', -- upcoming, registration_open, in_progress, completed, cancelled
  
  -- Results
  winner_team_id TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_seasons_league ON league_seasons(league_id);
CREATE INDEX idx_seasons_status ON league_seasons(status);
CREATE INDEX idx_seasons_dates ON league_seasons(season_starts, season_ends);

-- ============================================
-- 3. LEAGUE REGISTRATIONS
-- ============================================

CREATE TABLE league_registrations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  league_id TEXT NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  season_id TEXT REFERENCES league_seasons(id) ON DELETE CASCADE,
  
  -- Registration details
  registration_type TEXT, -- individual, team
  team_name TEXT,
  partner_user_id TEXT, -- For doubles
  
  -- Skill/preferences
  skill_level TEXT, -- beginner, intermediate, advanced
  preferred_day TEXT[],
  notes TEXT,
  
  -- Payment
  fee_amount DECIMAL(10, 2),
  payment_status TEXT DEFAULT 'pending', -- pending, paid, refunded
  payment_id TEXT, -- Stripe payment ID
  paid_at TIMESTAMP,
  
  -- Status
  status TEXT DEFAULT 'pending', -- pending, confirmed, waitlist, cancelled
  waitlist_position INTEGER,
  confirmed_at TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, season_id)
);

CREATE INDEX idx_registrations_user ON league_registrations(user_id);
CREATE INDEX idx_registrations_league ON league_registrations(league_id);
CREATE INDEX idx_registrations_season ON league_registrations(season_id);
CREATE INDEX idx_registrations_status ON league_registrations(status);

-- ============================================
-- 4. LEAGUE REVIEWS
-- ============================================

CREATE TABLE league_reviews (
  id TEXT PRIMARY KEY,
  league_id TEXT NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  season_id TEXT REFERENCES league_seasons(id),
  
  -- Review
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  review_text TEXT,
  
  -- Categories
  organization_rating INTEGER CHECK (organization_rating >= 1 AND organization_rating <= 5),
  competition_level_rating INTEGER CHECK (competition_level_rating >= 1 AND competition_level_rating <= 5),
  value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),
  
  -- Recommendation
  would_recommend BOOLEAN,
  
  -- Status
  is_verified BOOLEAN DEFAULT false, -- Only verified participants can review
  is_flagged BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, league_id, season_id)
);

CREATE INDEX idx_league_reviews_league ON league_reviews(league_id);
CREATE INDEX idx_league_reviews_user ON league_reviews(user_id);
CREATE INDEX idx_league_reviews_rating ON league_reviews(rating);

-- ============================================
-- 5. LEAGUE SUBMISSIONS (User-Generated)
-- ============================================

CREATE TABLE league_submissions (
  id TEXT PRIMARY KEY,
  submitted_by TEXT NOT NULL,
  
  -- League info (user-provided)
  league_name TEXT NOT NULL,
  sport TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  venue_name TEXT,
  
  -- Contact
  organizer_name TEXT,
  organizer_email TEXT,
  website TEXT,
  
  -- Details
  description TEXT,
  skill_levels TEXT[],
  registration_fee DECIMAL(10, 2),
  
  -- Status
  status TEXT DEFAULT 'pending', -- pending, approved, rejected
  reviewed_by TEXT,
  reviewed_at TIMESTAMP,
  rejection_reason TEXT,
  
  -- If approved, link to created league
  approved_league_id TEXT REFERENCES leagues(id),
  
  -- Reward
  reward_amount DECIMAL(10, 2) DEFAULT 5.00, -- $5 credit for submitting
  reward_paid BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_submissions_user ON league_submissions(submitted_by);
CREATE INDEX idx_submissions_status ON league_submissions(status);

-- ============================================
-- SEED DATA - Example Leagues
-- ============================================

-- Example leagues (you'll add real ones)
INSERT INTO leagues (
  id, name, sport, city, state, venue_name, skill_levels, 
  registration_fee, registration_status, description, website
) VALUES
(
  'league_austin_tennis_1',
  'Austin Tennis League',
  'tennis',
  'Austin',
  'TX',
  'Zilker Tennis Center',
  ARRAY['intermediate', 'advanced'],
  75.00,
  'open',
  'Competitive adult tennis league with weekly matches and playoffs',
  'https://example.com/atl'
),
(
  'league_la_basketball_1',
  'LA Rec Basketball League',
  'basketball',
  'Los Angeles',
  'CA',
  'Venice Beach Courts',
  ARRAY['open'],
  50.00,
  'open',
  '5v5 recreational basketball league for adults 21+',
  'https://example.com/labl'
),
(
  'league_nyc_pickleball_1',
  'NYC Pickleball League',
  'pickleball',
  'New York',
  'NY',
  'Central Park Courts',
  ARRAY['beginner', 'intermediate'],
  60.00,
  'open',
  'Fun and competitive pickleball league in the heart of NYC',
  'https://example.com/nycpl'
);

-- Success message
SELECT '✅ GEE Leagues Database Created!' as status,
       (SELECT COUNT(*) FROM leagues) as sample_leagues;


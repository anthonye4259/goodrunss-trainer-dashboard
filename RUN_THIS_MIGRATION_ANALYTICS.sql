-- =====================================================
-- GOODRUNSS ANALYTICS TRACKING SYSTEM
-- Custom product analytics for insights & growth
-- =====================================================

-- 1. Analytics Events Table
-- Tracks every user action across the platform
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Event identification
  event_name VARCHAR(100) NOT NULL,
  event_category VARCHAR(50), -- 'user', 'booking', 'social', 'payment', etc.
  
  -- User & session tracking
  user_id UUID,
  session_id UUID,
  anonymous_id VARCHAR(255), -- For tracking before signup
  
  -- Event details
  properties JSONB DEFAULT '{}', -- Flexible event metadata
  
  -- Context
  device_type VARCHAR(50), -- 'mobile', 'tablet', 'desktop'
  platform VARCHAR(50), -- 'ios', 'android', 'web'
  app_version VARCHAR(20),
  os_version VARCHAR(50),
  
  -- Location
  ip_address INET,
  country VARCHAR(2),
  city VARCHAR(100),
  
  -- Referral tracking
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  utm_content VARCHAR(100),
  utm_term VARCHAR(100),
  referrer TEXT,
  
  -- Timing
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes for fast queries
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_session_id ON analytics_events(session_id);
CREATE INDEX idx_analytics_events_event_name ON analytics_events(event_name);
CREATE INDEX idx_analytics_events_event_category ON analytics_events(event_category);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX idx_analytics_events_properties ON analytics_events USING gin(properties);

-- 2. User Sessions Table
-- Tracks user sessions for engagement analysis
CREATE TABLE IF NOT EXISTS analytics_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  user_id UUID,
  anonymous_id VARCHAR(255),
  
  -- Session details
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INT, -- Auto-calculated
  
  -- Engagement
  event_count INT DEFAULT 0,
  page_views INT DEFAULT 0,
  
  -- Device & platform
  device_type VARCHAR(50),
  platform VARCHAR(50),
  browser VARCHAR(50),
  
  -- Entry/Exit
  entry_page TEXT,
  exit_page TEXT,
  
  -- Location
  country VARCHAR(2),
  city VARCHAR(100),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT fk_session_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_analytics_sessions_user_id ON analytics_sessions(user_id);
CREATE INDEX idx_analytics_sessions_started_at ON analytics_sessions(started_at DESC);

-- 3. Funnel Definitions Table
-- Define conversion funnels to track
CREATE TABLE IF NOT EXISTS analytics_funnels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  name VARCHAR(100) NOT NULL,
  description TEXT,
  
  -- Funnel steps (ordered array of event names)
  steps JSONB NOT NULL, -- ['signup_started', 'signup_completed', 'first_booking']
  
  -- Filters
  filters JSONB DEFAULT '{}', -- Optional filters for funnel analysis
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. User Cohorts Table
-- Track user cohorts for retention analysis
CREATE TABLE IF NOT EXISTS analytics_cohorts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  name VARCHAR(100) NOT NULL,
  description TEXT,
  
  -- Cohort definition
  cohort_type VARCHAR(50) NOT NULL, -- 'signup_date', 'first_booking', 'custom'
  start_date DATE NOT NULL,
  end_date DATE,
  
  -- Filters
  filters JSONB DEFAULT '{}',
  
  -- Stats (cached for performance)
  user_count INT DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Retention Metrics Table (Pre-aggregated)
-- Pre-calculated retention metrics for fast dashboard loading
CREATE TABLE IF NOT EXISTS analytics_retention (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  cohort_id UUID,
  
  -- Retention period
  period_type VARCHAR(20) NOT NULL, -- 'daily', 'weekly', 'monthly'
  period_number INT NOT NULL, -- Day 1, Week 2, Month 3, etc.
  
  -- Metrics
  total_users INT NOT NULL,
  retained_users INT NOT NULL,
  retention_rate DECIMAL(5,2), -- Percentage
  
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT fk_retention_cohort FOREIGN KEY (cohort_id) REFERENCES analytics_cohorts(id) ON DELETE CASCADE
);

CREATE INDEX idx_analytics_retention_cohort_id ON analytics_retention(cohort_id);
CREATE INDEX idx_analytics_retention_period ON analytics_retention(period_type, period_number);

-- 6. Daily Metrics Table (Pre-aggregated)
-- Daily aggregated metrics for dashboard
CREATE TABLE IF NOT EXISTS analytics_daily_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  date DATE NOT NULL UNIQUE,
  
  -- User metrics
  daily_active_users INT DEFAULT 0,
  new_signups INT DEFAULT 0,
  total_users INT DEFAULT 0,
  
  -- Booking metrics
  total_bookings INT DEFAULT 0,
  total_revenue_cents BIGINT DEFAULT 0,
  
  -- Engagement metrics
  total_sessions INT DEFAULT 0,
  avg_session_duration_seconds INT DEFAULT 0,
  total_events INT DEFAULT 0,
  
  -- Social metrics
  new_groups INT DEFAULT 0,
  new_friendships INT DEFAULT 0,
  messages_sent INT DEFAULT 0,
  
  -- Growth metrics
  referrals INT DEFAULT 0,
  shares INT DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_analytics_daily_metrics_date ON analytics_daily_metrics(date DESC);

-- 7. Event Properties Schema (For reference)
-- This is not a table, just documentation of common event properties

-- Common events to track:
-- USER EVENTS:
--   - signup_started { method: 'email'|'google'|'apple' }
--   - signup_completed { method, user_id }
--   - login { method }
--   - profile_updated { fields: ['name', 'avatar'] }
--   - logout

-- BOOKING EVENTS:
--   - booking_search_started { sport, location }
--   - facility_viewed { facility_id, facility_name }
--   - booking_flow_started { facility_id, resource_id }
--   - booking_created { booking_id, amount_cents, sport }
--   - booking_completed { booking_id, payment_method }
--   - booking_cancelled { booking_id, reason }

-- SOCIAL EVENTS:
--   - friend_request_sent { to_user_id }
--   - friend_request_accepted { from_user_id }
--   - group_created { group_id, member_count }
--   - message_sent { conversation_id, type }
--   - match_request_sent { to_user_id, sport }

-- PAYMENT EVENTS:
--   - payment_method_added { type: 'card' }
--   - payment_initiated { amount_cents }
--   - payment_completed { amount_cents, payment_id }
--   - payment_failed { error, amount_cents }

-- ENGAGEMENT EVENTS:
--   - app_opened
--   - page_viewed { page, path }
--   - feature_used { feature_name }
--   - search_performed { query, results_count }
--   - notification_clicked { type }

-- GROWTH EVENTS:
--   - referral_shared { method: 'instagram'|'twitter'|'copy' }
--   - referral_signup { referrer_id }
--   - achievement_shared { type, value }

-- 8. Functions for analytics

-- Function to calculate session duration
CREATE OR REPLACE FUNCTION update_session_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ended_at IS NOT NULL THEN
    NEW.duration_seconds := EXTRACT(EPOCH FROM (NEW.ended_at - NEW.started_at))::INT;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_session_duration
BEFORE UPDATE ON analytics_sessions
FOR EACH ROW
EXECUTE FUNCTION update_session_duration();

-- Function to increment event count in session
CREATE OR REPLACE FUNCTION increment_session_event_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE analytics_sessions
  SET event_count = event_count + 1,
      ended_at = NEW.created_at
  WHERE id = NEW.session_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_session_event_count
AFTER INSERT ON analytics_events
FOR EACH ROW
WHEN (NEW.session_id IS NOT NULL)
EXECUTE FUNCTION increment_session_event_count();

-- View for DAU/WAU/MAU
CREATE OR REPLACE VIEW analytics_active_users AS
SELECT
  DATE_TRUNC('day', created_at) AS date,
  COUNT(DISTINCT user_id) FILTER (WHERE created_at >= NOW() - INTERVAL '1 day') AS dau,
  COUNT(DISTINCT user_id) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') AS wau,
  COUNT(DISTINCT user_id) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') AS mau
FROM analytics_events
WHERE user_id IS NOT NULL
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;

-- View for event frequency
CREATE OR REPLACE VIEW analytics_event_frequency AS
SELECT
  event_name,
  event_category,
  COUNT(*) AS total_count,
  COUNT(DISTINCT user_id) AS unique_users,
  DATE_TRUNC('day', created_at) AS date
FROM analytics_events
GROUP BY event_name, event_category, DATE_TRUNC('day', created_at)
ORDER BY total_count DESC;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Analytics schema created successfully!';
  RAISE NOTICE '📊 Tables: analytics_events, analytics_sessions, analytics_funnels, analytics_cohorts, analytics_retention, analytics_daily_metrics';
  RAISE NOTICE '🎯 Ready to track: signups, bookings, social, payments, engagement, growth';
END $$;


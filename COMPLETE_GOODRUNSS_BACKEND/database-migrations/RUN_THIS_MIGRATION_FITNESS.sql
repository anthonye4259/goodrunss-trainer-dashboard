-- =====================================================
-- GOODRUNSS FITNESS/WEARABLE INTEGRATIONS
-- Store data from Strava, Whoop, Apple Health, Google Fit
-- =====================================================

-- 1. Fitness Integrations Table
-- Store OAuth tokens and integration settings
CREATE TABLE IF NOT EXISTS fitness_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  user_id TEXT NOT NULL,
  integration_type VARCHAR(50) NOT NULL, -- 'strava', 'whoop', 'apple_health', 'google_fit'
  
  -- OAuth credentials
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Integration settings
  is_active BOOLEAN DEFAULT true,
  sync_enabled BOOLEAN DEFAULT true,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  external_user_id TEXT, -- User ID in external system
  scopes TEXT[], -- Granted permissions
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_fitness_integrations_user_id ON fitness_integrations(user_id);
CREATE INDEX idx_fitness_integrations_type ON fitness_integrations(integration_type);
CREATE UNIQUE INDEX idx_fitness_integrations_user_type ON fitness_integrations(user_id, integration_type);

-- 2. Fitness Activities Table
-- Store workouts/activities from all sources
CREATE TABLE IF NOT EXISTS fitness_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  user_id TEXT NOT NULL,
  integration_type VARCHAR(50) NOT NULL, -- Source: 'strava', 'whoop', 'apple_health', 'google_fit'
  external_id TEXT, -- ID in external system
  
  -- Activity details
  activity_type VARCHAR(100), -- 'run', 'bike', 'tennis', 'basketball', etc.
  title VARCHAR(255),
  description TEXT,
  
  -- Timing
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INT, -- Total duration
  moving_time_seconds INT, -- Active time (Strava)
  
  -- Distance & Speed
  distance_meters DECIMAL(10, 2), -- Total distance
  average_speed DECIMAL(10, 2), -- m/s
  max_speed DECIMAL(10, 2), -- m/s
  
  -- Heart Rate
  average_heartrate INT, -- bpm
  max_heartrate INT, -- bpm
  
  -- Effort
  calories_burned INT,
  elevation_gain DECIMAL(10, 2), -- meters
  
  -- Location
  start_location JSONB, -- {lat, lon, name}
  end_location JSONB,
  
  -- Whoop-specific
  strain_score DECIMAL(5, 2), -- 0-21
  recovery_score DECIMAL(5, 2), -- 0-100%
  hrv INT, -- Heart Rate Variability
  
  -- Raw data
  raw_data JSONB, -- Full response from API
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_fitness_activities_user_id ON fitness_activities(user_id);
CREATE INDEX idx_fitness_activities_type ON fitness_activities(integration_type);
CREATE INDEX idx_fitness_activities_started_at ON fitness_activities(started_at DESC);
CREATE INDEX idx_fitness_activities_activity_type ON fitness_activities(activity_type);
CREATE UNIQUE INDEX idx_fitness_activities_external ON fitness_activities(user_id, integration_type, external_id);

-- 3. Whoop Recovery Data Table
-- Daily recovery scores from Whoop
CREATE TABLE IF NOT EXISTS whoop_recovery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  user_id TEXT NOT NULL,
  external_id TEXT, -- Whoop cycle ID
  
  -- Date
  date DATE NOT NULL,
  
  -- Recovery
  recovery_score DECIMAL(5, 2), -- 0-100%
  resting_heart_rate INT, -- bpm
  hrv_rmssd DECIMAL(10, 2), -- Heart Rate Variability
  
  -- Sleep
  sleep_performance DECIMAL(5, 2), -- 0-100%
  sleep_duration_seconds INT,
  sleep_needed_seconds INT,
  sleep_debt_seconds INT,
  
  -- Strain
  day_strain DECIMAL(5, 2), -- 0-21
  day_calories INT,
  
  -- Raw data
  raw_data JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, date)
);

CREATE INDEX idx_whoop_recovery_user_id ON whoop_recovery(user_id);
CREATE INDEX idx_whoop_recovery_date ON whoop_recovery(date DESC);

-- 4. Daily Health Metrics Table
-- Aggregated daily metrics from all sources
CREATE TABLE IF NOT EXISTS daily_health_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  user_id TEXT NOT NULL,
  date DATE NOT NULL,
  
  -- Activity
  steps INT DEFAULT 0,
  distance_meters DECIMAL(10, 2) DEFAULT 0,
  calories_burned INT DEFAULT 0,
  active_minutes INT DEFAULT 0,
  
  -- Workouts
  workout_count INT DEFAULT 0,
  workout_minutes INT DEFAULT 0,
  
  -- Recovery (from Whoop)
  recovery_score DECIMAL(5, 2),
  strain_score DECIMAL(5, 2),
  
  -- Sleep
  sleep_hours DECIMAL(5, 2),
  
  -- Heart
  resting_heart_rate INT,
  average_heart_rate INT,
  
  -- Sources that contributed
  sources TEXT[], -- ['strava', 'whoop', 'apple_health']
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, date)
);

CREATE INDEX idx_daily_health_metrics_user_id ON daily_health_metrics(user_id);
CREATE INDEX idx_daily_health_metrics_date ON daily_health_metrics(date DESC);

-- 5. Fitness Goals Table
-- User-set fitness goals
CREATE TABLE IF NOT EXISTS fitness_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  user_id TEXT NOT NULL,
  
  goal_type VARCHAR(50) NOT NULL, -- 'weekly_workouts', 'monthly_distance', 'daily_steps'
  target_value INT NOT NULL,
  current_value INT DEFAULT 0,
  
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'completed', 'failed'
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_fitness_goals_user_id ON fitness_goals(user_id);
CREATE INDEX idx_fitness_goals_status ON fitness_goals(status);

-- 6. Sync Logs Table (reuse from facility_integrations or create new)
CREATE TABLE IF NOT EXISTS fitness_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  user_id TEXT NOT NULL,
  integration_type VARCHAR(50) NOT NULL,
  
  sync_type VARCHAR(50), -- 'activities', 'recovery', 'daily_metrics'
  records_synced INT DEFAULT 0,
  
  status VARCHAR(20), -- 'success', 'partial', 'failed'
  error_message TEXT,
  
  synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_fitness_sync_logs_user_id ON fitness_sync_logs(user_id);
CREATE INDEX idx_fitness_sync_logs_synced_at ON fitness_sync_logs(synced_at DESC);

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Fitness integrations schema created successfully!';
  RAISE NOTICE '🏃 Tables: fitness_integrations, fitness_activities, whoop_recovery, daily_health_metrics, fitness_goals, fitness_sync_logs';
  RAISE NOTICE '💪 Ready for: Strava, Whoop, Apple Health, Google Fit';
END $$;


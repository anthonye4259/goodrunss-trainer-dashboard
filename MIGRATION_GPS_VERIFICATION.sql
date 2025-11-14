-- 🎯 GPS VERIFICATION & CONFIDENCE SCORING
-- Adds fields for data quality tracking

-- Add new columns to facility_reports table
ALTER TABLE facility_reports
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS gps_accuracy DECIMAL(10, 2), -- meters
ADD COLUMN IF NOT EXISTS device_type TEXT,
ADD COLUMN IF NOT EXISTS app_version TEXT,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS confidence_score DECIMAL(3, 2) DEFAULT 0.50 CHECK (confidence_score >= 0 AND confidence_score <= 1),
ADD COLUMN IF NOT EXISTS quality_warnings JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS distance_from_facility DECIMAL(10, 2); -- meters

-- Add indexes for GPS queries
CREATE INDEX IF NOT EXISTS idx_facility_reports_verified ON facility_reports(is_verified);
CREATE INDEX IF NOT EXISTS idx_facility_reports_confidence ON facility_reports(confidence_score DESC);
CREATE INDEX IF NOT EXISTS idx_facility_reports_location ON facility_reports(latitude, longitude);

-- Create data quality metrics table
CREATE TABLE IF NOT EXISTS facility_data_quality (
  id TEXT PRIMARY KEY,
  facility_id TEXT NOT NULL,
  date DATE NOT NULL,
  
  -- Quality metrics
  total_checkins INTEGER DEFAULT 0,
  verified_checkins INTEGER DEFAULT 0,
  avg_confidence DECIMAL(3, 2) DEFAULT 0.00,
  avg_gps_accuracy DECIMAL(10, 2),
  
  -- Ratings
  overall_quality TEXT CHECK (overall_quality IN ('excellent', 'good', 'fair', 'poor')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(facility_id, date)
);

CREATE INDEX IF NOT EXISTS idx_facility_data_quality_facility ON facility_data_quality(facility_id);
CREATE INDEX IF NOT EXISTS idx_facility_data_quality_date ON facility_data_quality(date DESC);
CREATE INDEX IF NOT EXISTS idx_facility_data_quality_overall ON facility_data_quality(overall_quality);

-- Create user reputation stats table
CREATE TABLE IF NOT EXISTS user_reputation (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  
  -- Stats
  total_checkins INTEGER DEFAULT 0,
  verified_checkins INTEGER DEFAULT 0,
  reported_issues INTEGER DEFAULT 0,
  badges_earned INTEGER DEFAULT 0,
  
  -- Calculated reputation
  reputation_score DECIMAL(3, 2) DEFAULT 0.50 CHECK (reputation_score >= 0 AND reputation_score <= 1),
  reputation_tier TEXT CHECK (reputation_tier IN ('high', 'medium', 'low')) DEFAULT 'low',
  
  -- Timestamps
  first_checkin_at TIMESTAMP WITH TIME ZONE,
  last_checkin_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_reputation_user_id ON user_reputation(user_id);
CREATE INDEX IF NOT EXISTS idx_user_reputation_tier ON user_reputation(reputation_tier);
CREATE INDEX IF NOT EXISTS idx_user_reputation_score ON user_reputation(reputation_score DESC);

-- Function to update user reputation after check-in
CREATE OR REPLACE FUNCTION update_user_reputation()
RETURNS TRIGGER AS $$
BEGIN
  -- Upsert user reputation
  INSERT INTO user_reputation (
    id,
    user_id,
    total_checkins,
    verified_checkins,
    reputation_score,
    reputation_tier,
    first_checkin_at,
    last_checkin_at
  )
  VALUES (
    'rep_' || NEW.user_id,
    NEW.user_id,
    1,
    CASE WHEN NEW.is_verified THEN 1 ELSE 0 END,
    COALESCE(NEW.confidence_score, 0.50),
    'low',
    NEW.created_at,
    NEW.created_at
  )
  ON CONFLICT (user_id) DO UPDATE SET
    total_checkins = user_reputation.total_checkins + 1,
    verified_checkins = user_reputation.verified_checkins + CASE WHEN NEW.is_verified THEN 1 ELSE 0 END,
    reputation_score = (
      user_reputation.reputation_score * user_reputation.total_checkins + COALESCE(NEW.confidence_score, 0.50)
    ) / (user_reputation.total_checkins + 1),
    reputation_tier = CASE
      WHEN (user_reputation.total_checkins + 1) > 50 
           AND ((user_reputation.verified_checkins + CASE WHEN NEW.is_verified THEN 1 ELSE 0 END)::float / (user_reputation.total_checkins + 1)) > 0.8
      THEN 'high'
      WHEN (user_reputation.total_checkins + 1) > 10
           AND ((user_reputation.verified_checkins + CASE WHEN NEW.is_verified THEN 1 ELSE 0 END)::float / (user_reputation.total_checkins + 1)) > 0.6
      THEN 'medium'
      ELSE 'low'
    END,
    last_checkin_at = NEW.created_at,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_user_reputation ON facility_reports;
CREATE TRIGGER trigger_update_user_reputation
  AFTER INSERT ON facility_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_user_reputation();

-- Function to calculate daily facility data quality
CREATE OR REPLACE FUNCTION calculate_facility_data_quality(p_date DATE)
RETURNS void AS $$
BEGIN
  INSERT INTO facility_data_quality (
    id,
    facility_id,
    date,
    total_checkins,
    verified_checkins,
    avg_confidence,
    avg_gps_accuracy,
    overall_quality
  )
  SELECT
    'fdq_' || facility_id || '_' || p_date,
    facility_id,
    p_date,
    COUNT(*) as total_checkins,
    SUM(CASE WHEN is_verified THEN 1 ELSE 0 END) as verified_checkins,
    AVG(confidence_score) as avg_confidence,
    AVG(gps_accuracy) as avg_gps_accuracy,
    CASE
      WHEN AVG(confidence_score) >= 0.85 AND (SUM(CASE WHEN is_verified THEN 1 ELSE 0 END)::float / COUNT(*)) >= 0.80 THEN 'excellent'
      WHEN AVG(confidence_score) >= 0.70 AND (SUM(CASE WHEN is_verified THEN 1 ELSE 0 END)::float / COUNT(*)) >= 0.60 THEN 'good'
      WHEN AVG(confidence_score) >= 0.50 AND (SUM(CASE WHEN is_verified THEN 1 ELSE 0 END)::float / COUNT(*)) >= 0.40 THEN 'fair'
      ELSE 'poor'
    END as overall_quality
  FROM facility_reports
  WHERE DATE(created_at) = p_date
  GROUP BY facility_id
  ON CONFLICT (facility_id, date) DO UPDATE SET
    total_checkins = EXCLUDED.total_checkins,
    verified_checkins = EXCLUDED.verified_checkins,
    avg_confidence = EXCLUDED.avg_confidence,
    avg_gps_accuracy = EXCLUDED.avg_gps_accuracy,
    overall_quality = EXCLUDED.overall_quality,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON COLUMN facility_reports.latitude IS 'User GPS latitude at time of check-in';
COMMENT ON COLUMN facility_reports.longitude IS 'User GPS longitude at time of check-in';
COMMENT ON COLUMN facility_reports.gps_accuracy IS 'GPS accuracy in meters (lower is better)';
COMMENT ON COLUMN facility_reports.is_verified IS 'Check-in is verified (within 100m, confidence >= 0.70)';
COMMENT ON COLUMN facility_reports.confidence_score IS 'Data quality confidence score (0.0 to 1.0)';
COMMENT ON COLUMN facility_reports.quality_warnings IS 'Array of quality warnings (e.g., "GPS accuracy low")';
COMMENT ON COLUMN facility_reports.distance_from_facility IS 'Distance from facility in meters';

COMMENT ON TABLE facility_data_quality IS 'Daily data quality metrics per facility';
COMMENT ON TABLE user_reputation IS 'User reputation scores based on check-in quality and frequency';

-- Create view for high-quality check-ins only
CREATE OR REPLACE VIEW verified_facility_reports AS
SELECT *
FROM facility_reports
WHERE is_verified = TRUE
  AND confidence_score >= 0.70;

COMMENT ON VIEW verified_facility_reports IS 'Only verified, high-quality check-ins for AI training';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ GPS Verification & Confidence Scoring migration complete!';
  RAISE NOTICE '📊 Added columns: latitude, longitude, gps_accuracy, confidence_score, is_verified';
  RAISE NOTICE '📈 Created tables: facility_data_quality, user_reputation';
  RAISE NOTICE '🔄 Created triggers: Auto-update user reputation on check-in';
  RAISE NOTICE '📋 Created view: verified_facility_reports (for AI training)';
END $$;


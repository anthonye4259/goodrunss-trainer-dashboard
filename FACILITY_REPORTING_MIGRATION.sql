-- ========================================
-- FACILITY REPORTING & GAMIFICATION SYSTEM
-- Complete system with rewards, badges, leaderboards
-- ========================================

-- Facility condition reports (traffic, crowd, skill level, etc.)
CREATE TABLE IF NOT EXISTS facility_reports (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "facilityId" TEXT NOT NULL,
  
  -- Location details
  sport TEXT NOT NULL, -- tennis, golf, basketball, yoga, etc
  "specificLocation" TEXT, -- "Court #3", "Hole 7", "Studio A"
  
  -- Conditions
  "crowdLevel" TEXT, -- empty, light, moderate, busy, packed
  "skillLevel" TEXT, -- beginner, intermediate, advanced, mixed
  "ageGroup" TEXT, -- kids, teens, adults, seniors, mixed
  "weatherCondition" TEXT, -- sunny, cloudy, windy, hot, cold
  "surfaceCondition" TEXT, -- excellent, good, fair, poor
  "waitTime" INTEGER, -- minutes
  "parkingAvailability" TEXT, -- plenty, limited, full
  
  -- Optional details
  notes TEXT,
  photos TEXT[], -- array of photo URLs
  videos TEXT[], -- array of video URLs
  
  -- Engagement
  "helpfulVotes" INTEGER DEFAULT 0,
  "notHelpfulVotes" INTEGER DEFAULT 0,
  confirmations INTEGER DEFAULT 0, -- other users confirming
  
  -- Rewards
  "rewardAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "bonusAmount" DOUBLE PRECISION DEFAULT 0,
  "streakMultiplier" DOUBLE PRECISION DEFAULT 1.0,
  
  -- Metadata
  "reportQuality" INTEGER, -- 1-5 stars (auto-calculated)
  "isVerified" BOOLEAN DEFAULT false,
  "gpsLat" DOUBLE PRECISION,
  "gpsLng" DOUBLE PRECISION,
  
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "facility_reports_userId_idx" ON facility_reports("userId");
CREATE INDEX IF NOT EXISTS "facility_reports_facilityId_idx" ON facility_reports("facilityId");
CREATE INDEX IF NOT EXISTS "facility_reports_sport_idx" ON facility_reports(sport);
CREATE INDEX IF NOT EXISTS "facility_reports_createdAt_idx" ON facility_reports("createdAt");

-- Maintenance reports (broken equipment, repairs needed)
CREATE TABLE IF NOT EXISTS maintenance_reports (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "facilityId" TEXT NOT NULL,
  
  -- Issue details
  sport TEXT NOT NULL,
  "specificLocation" TEXT, -- "Court #3", "Hole 7"
  category TEXT NOT NULL, -- net, surface, lighting, bathroom, etc
  issue TEXT NOT NULL, -- specific issue
  severity TEXT NOT NULL, -- low, medium, high, urgent
  description TEXT,
  
  -- Media
  photos TEXT[],
  videos TEXT[],
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'reported', -- reported, acknowledged, in_progress, fixed, verified
  "acknowledgedAt" TIMESTAMP(3),
  "inProgressAt" TIMESTAMP(3),
  "fixedAt" TIMESTAMP(3),
  "verifiedAt" TIMESTAMP(3),
  
  -- Engagement
  confirmations INTEGER DEFAULT 0,
  "helpfulVotes" INTEGER DEFAULT 0,
  
  -- Rewards
  "rewardAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "bonusAmount" DOUBLE PRECISION DEFAULT 0,
  
  -- Facility response
  "facilityNotes" TEXT,
  "estimatedFixDate" DATE,
  "actualCost" DOUBLE PRECISION,
  "fixDuration" INTEGER, -- hours to fix
  
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "maintenance_reports_userId_idx" ON maintenance_reports("userId");
CREATE INDEX IF NOT EXISTS "maintenance_reports_facilityId_idx" ON maintenance_reports("facilityId");
CREATE INDEX IF NOT EXISTS "maintenance_reports_status_idx" ON maintenance_reports(status);
CREATE INDEX IF NOT EXISTS "maintenance_reports_severity_idx" ON maintenance_reports(severity);
CREATE INDEX IF NOT EXISTS "maintenance_reports_createdAt_idx" ON maintenance_reports("createdAt");

-- Report confirmations (other users confirming reports)
CREATE TABLE IF NOT EXISTS report_confirmations (
  id TEXT PRIMARY KEY,
  "reportId" TEXT NOT NULL,
  "reportType" TEXT NOT NULL, -- facility or maintenance
  "userId" TEXT NOT NULL,
  "confirmationType" TEXT NOT NULL, -- confirm_issue, confirm_fixed, helpful, not_helpful
  notes TEXT,
  photo TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "report_confirmations_reportId_idx" ON report_confirmations("reportId");
CREATE INDEX IF NOT EXISTS "report_confirmations_userId_idx" ON report_confirmations("userId");

-- User reporter stats (levels, streaks, earnings)
CREATE TABLE IF NOT EXISTS user_reporter_stats (
  "userId" TEXT PRIMARY KEY,
  
  -- Counts
  "totalReports" INTEGER DEFAULT 0,
  "facilityReports" INTEGER DEFAULT 0,
  "maintenanceReports" INTEGER DEFAULT 0,
  
  -- Streaks
  "currentStreak" INTEGER DEFAULT 0,
  "longestStreak" INTEGER DEFAULT 0,
  "lastReportDate" DATE,
  
  -- Earnings
  "totalEarned" DOUBLE PRECISION DEFAULT 0,
  "totalBonuses" DOUBLE PRECISION DEFAULT 0,
  "pendingCredits" DOUBLE PRECISION DEFAULT 0,
  
  -- Quality metrics
  "averageQuality" DOUBLE PRECISION DEFAULT 0,
  "helpfulVotesReceived" INTEGER DEFAULT 0,
  "confirmationsReceived" INTEGER DEFAULT 0,
  
  -- Level & XP
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  
  -- Rankings
  "weeklyRank" INTEGER,
  "monthlyRank" INTEGER,
  "allTimeRank" INTEGER,
  
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "user_reporter_stats_level_idx" ON user_reporter_stats(level);
CREATE INDEX IF NOT EXISTS "user_reporter_stats_totalReports_idx" ON user_reporter_stats("totalReports");
CREATE INDEX IF NOT EXISTS "user_reporter_stats_weeklyRank_idx" ON user_reporter_stats("weeklyRank");

-- Badges
CREATE TABLE IF NOT EXISTS reporter_badges (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  "displayName" TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL, -- milestone, special, sport, maintenance
  requirement JSONB NOT NULL, -- conditions to earn
  rarity TEXT NOT NULL, -- common, uncommon, rare, epic, legendary
  "sortOrder" INTEGER DEFAULT 0,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- User badges (earned)
CREATE TABLE IF NOT EXISTS user_badges (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "badgeId" TEXT NOT NULL,
  "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  progress JSONB, -- for tracking partial progress
  
  UNIQUE("userId", "badgeId"),
  FOREIGN KEY ("badgeId") REFERENCES reporter_badges(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "user_badges_userId_idx" ON user_badges("userId");
CREATE INDEX IF NOT EXISTS "user_badges_earnedAt_idx" ON user_badges("earnedAt");

-- Challenges/Quests
CREATE TABLE IF NOT EXISTS reporter_challenges (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  "displayName" TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL, -- weekly, monthly, special
  category TEXT NOT NULL, -- facility, maintenance, mixed
  
  -- Requirements
  requirement JSONB NOT NULL,
  
  -- Rewards
  "cashReward" DOUBLE PRECISION DEFAULT 0,
  "creditReward" DOUBLE PRECISION DEFAULT 0,
  "badgeReward" TEXT, -- badge ID
  
  -- Schedule
  "startDate" TIMESTAMP(3) NOT NULL,
  "endDate" TIMESTAMP(3) NOT NULL,
  "isActive" BOOLEAN DEFAULT true,
  
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- User challenge progress
CREATE TABLE IF NOT EXISTS user_challenges (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "challengeId" TEXT NOT NULL,
  progress JSONB NOT NULL, -- track progress
  completed BOOLEAN DEFAULT false,
  "completedAt" TIMESTAMP(3),
  claimed BOOLEAN DEFAULT false,
  "claimedAt" TIMESTAMP(3),
  
  UNIQUE("userId", "challengeId"),
  FOREIGN KEY ("challengeId") REFERENCES reporter_challenges(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "user_challenges_userId_idx" ON user_challenges("userId");
CREATE INDEX IF NOT EXISTS "user_challenges_completed_idx" ON user_challenges(completed);

-- Leaderboard snapshots (for historical tracking)
CREATE TABLE IF NOT EXISTS leaderboard_snapshots (
  id TEXT PRIMARY KEY,
  period TEXT NOT NULL, -- weekly, monthly, all_time
  "periodStart" DATE NOT NULL,
  "periodEnd" DATE,
  rankings JSONB NOT NULL, -- array of {userId, rank, reports, earned}
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "leaderboard_snapshots_period_idx" ON leaderboard_snapshots(period);
CREATE INDEX IF NOT EXISTS "leaderboard_snapshots_periodStart_idx" ON leaderboard_snapshots("periodStart");

-- Maintenance categories (predefined per sport)
CREATE TABLE IF NOT EXISTS maintenance_categories (
  id TEXT PRIMARY KEY,
  sport TEXT NOT NULL,
  category TEXT NOT NULL,
  "displayName" TEXT NOT NULL,
  icon TEXT NOT NULL,
  "commonIssues" TEXT[], -- predefined issue options
  "sortOrder" INTEGER DEFAULT 0,
  "isActive" BOOLEAN DEFAULT true
);

CREATE INDEX IF NOT EXISTS "maintenance_categories_sport_idx" ON maintenance_categories(sport);

-- ========================================
-- SEED DEFAULT BADGES
-- ========================================

INSERT INTO reporter_badges (id, name, "displayName", description, icon, category, requirement, rarity, "sortOrder") VALUES
  ('badge_first_report', 'first_report', '🌱 First Report', 'Submit your first facility report', '🌱', 'milestone', '{"totalReports": 1}', 'common', 1),
  ('badge_10_reports', '10_reports', '⭐ Reporter', 'Submit 10 reports', '⭐', 'milestone', '{"totalReports": 10}', 'common', 2),
  ('badge_50_reports', '50_reports', '🌳 Contributor', 'Submit 50 reports', '🌳', 'milestone', '{"totalReports": 50}', 'uncommon', 3),
  ('badge_100_reports', '100_reports', '💎 Expert', 'Submit 100 reports', '💎', 'milestone', '{"totalReports": 100}', 'rare', 4),
  ('badge_500_reports', '500_reports', '👑 Master Scout', 'Submit 500 reports', '👑', 'milestone', '{"totalReports": 500}', 'epic', 5),
  ('badge_1000_reports', '1000_reports', '🏆 Legend', 'Submit 1000 reports', '🏆', 'milestone', '{"totalReports": 1000}', 'legendary', 6),
  
  ('badge_photographer', 'photographer', '📸 Photographer', 'Submit 50 reports with photos', '📸', 'special', '{"photosSubmitted": 50}', 'uncommon', 10),
  ('badge_videographer', 'videographer', '📹 Videographer', 'Submit 25 reports with videos', '📹', 'special', '{"videosSubmitted": 25}', 'rare', 11),
  ('badge_explorer', 'explorer', '🌎 Explorer', 'Report at 10 different facilities', '🌎', 'special', '{"uniqueFacilities": 10}', 'uncommon', 12),
  ('badge_streak_7', '7_day_streak', '🔥 Week Warrior', 'Maintain a 7-day reporting streak', '🔥', 'special', '{"streak": 7}', 'uncommon', 13),
  ('badge_streak_30', '30_day_streak', '🔥 Month Master', 'Maintain a 30-day reporting streak', '🔥', 'special', '{"streak": 30}', 'epic', 14),
  ('badge_streak_100', '100_day_streak', '🔥 Streak Legend', 'Maintain a 100-day reporting streak', '🔥', 'special', '{"streak": 100}', 'legendary', 15),
  
  ('badge_maintenance_helper', 'maintenance_helper', '🔧 Maintenance Helper', 'Submit 10 maintenance reports', '🔧', 'maintenance', '{"maintenanceReports": 10}', 'uncommon', 20),
  ('badge_facility_guardian', 'facility_guardian', '🦸 Facility Guardian', 'Submit 50 maintenance reports', '🦸', 'maintenance', '{"maintenanceReports": 50}', 'rare', 21),
  ('badge_safety_scout', 'safety_scout', '⚠️ Safety Scout', 'Report 5 high-severity issues', '⚠️', 'maintenance', '{"highSeverityReports": 5}', 'rare', 22),
  ('badge_emergency_reporter', 'emergency_reporter', '🚨 Emergency Reporter', 'Report 3 urgent issues', '🚨', 'maintenance', '{"urgentReports": 3}', 'epic', 23),
  
  ('badge_tennis_scout', 'tennis_scout', '🎾 Tennis Scout', 'Submit 25 tennis reports', '🎾', 'sport', '{"sportReports": {"tennis": 25}}', 'uncommon', 30),
  ('badge_golf_reporter', 'golf_reporter', '⛳ Golf Reporter', 'Submit 25 golf reports', '⛳', 'sport', '{"sportReports": {"golf": 25}}', 'uncommon', 31),
  ('badge_basketball_watcher', 'basketball_watcher', '🏀 Basketball Watcher', 'Submit 25 basketball reports', '🏀', 'sport', '{"sportReports": {"basketball": 25}}', 'uncommon', 32),
  ('badge_wellness_observer', 'wellness_observer', '🧘 Wellness Observer', 'Submit 25 yoga/pilates reports', '🧘', 'sport', '{"sportReports": {"yoga": 25}}', 'uncommon', 33),
  
  ('badge_helpful', 'helpful', '👥 Community Helper', 'Receive 100 helpful votes', '👥', 'special', '{"helpfulVotes": 100}', 'rare', 40),
  ('badge_speed_demon', 'speed_demon', '⚡ Speed Demon', 'Submit report within 5 minutes of arrival', '⚡', 'special', '{"quickReport": true}', 'uncommon', 41),
  ('badge_night_owl', 'night_owl', '🌙 Night Owl', 'Submit 20 reports after 8pm', '🌙', 'special', '{"nightReports": 20}', 'uncommon', 42),
  ('badge_early_bird', 'early_bird', '🌅 Early Bird', 'Submit 20 reports before 8am', '🌅', 'special', '{"morningReports": 20}', 'uncommon', 43),
  ('badge_weather_warrior', 'weather_warrior', '☔ Weather Warrior', 'Report in rain or snow', '☔', 'special', '{"badWeatherReports": 1}', 'rare', 44)
ON CONFLICT (name) DO UPDATE SET
  "displayName" = EXCLUDED."displayName",
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  requirement = EXCLUDED.requirement,
  "sortOrder" = EXCLUDED."sortOrder";

-- ========================================
-- SEED MAINTENANCE CATEGORIES
-- ========================================

INSERT INTO maintenance_categories (id, sport, category, "displayName", icon, "commonIssues", "sortOrder") VALUES
  -- Tennis
  ('maint_tennis_net', 'tennis', 'net', 'Net Issues', '🏐', ARRAY['Torn/Damaged', 'Sagging', 'Missing', 'Height Incorrect'], 1),
  ('maint_tennis_surface', 'tennis', 'surface', 'Court Surface', '🎾', ARRAY['Cracks', 'Holes', 'Uneven', 'Slippery'], 2),
  ('maint_tennis_lines', 'tennis', 'lines', 'Court Lines', '📏', ARRAY['Faded', 'Peeling', 'Missing'], 3),
  ('maint_tennis_lighting', 'tennis', 'lighting', 'Lighting', '💡', ARRAY['Burnt Out', 'Flickering', 'Too Dim'], 4),
  ('maint_tennis_fence', 'tennis', 'fence', 'Fence/Windscreen', '🚧', ARRAY['Holes', 'Tears', 'Bent'], 5),
  
  -- Golf
  ('maint_golf_tee', 'golf', 'tee_box', 'Tee Boxes', '🏌️', ARRAY['Damaged', 'Uneven', 'Bare Spots'], 1),
  ('maint_golf_green', 'golf', 'green', 'Greens', '⛳', ARRAY['Damaged', 'Bare Spots', 'Too Long', 'Too Short'], 2),
  ('maint_golf_bunker', 'golf', 'bunker', 'Bunkers', '🏖️', ARRAY['Needs Raking', 'Hard Sand', 'Weeds'], 3),
  ('maint_golf_fairway', 'golf', 'fairway', 'Fairways', '🌿', ARRAY['Divots', 'Bare Spots', 'Too Long'], 4),
  ('maint_golf_cart', 'golf', 'cart_path', 'Cart Paths', '🛤️', ARRAY['Cracks', 'Holes', 'Overgrown'], 5),
  
  -- Basketball
  ('maint_basketball_rim', 'basketball', 'rim', 'Rim/Net', '🏀', ARRAY['Bent Rim', 'Missing Net', 'Torn Net', 'Loose'], 1),
  ('maint_basketball_backboard', 'basketball', 'backboard', 'Backboard', '📋', ARRAY['Cracked', 'Graffiti', 'Loose'], 2),
  ('maint_basketball_surface', 'basketball', 'surface', 'Court Surface', '🏀', ARRAY['Cracks', 'Uneven', 'Slippery'], 3),
  
  -- Yoga/Wellness
  ('maint_yoga_mats', 'yoga', 'mats', 'Mats/Props', '🧘', ARRAY['Worn', 'Torn', 'Dirty', 'Missing'], 1),
  ('maint_yoga_mirrors', 'yoga', 'mirrors', 'Mirrors', '🪞', ARRAY['Cracked', 'Dirty', 'Loose'], 2),
  ('maint_yoga_flooring', 'yoga', 'flooring', 'Flooring', '🏢', ARRAY['Damaged', 'Stained', 'Slippery'], 3),
  ('maint_yoga_temp', 'yoga', 'temperature', 'Temperature', '🌡️', ARRAY['Too Hot', 'Too Cold', 'No AC/Heat'], 4),
  
  -- Common (all sports)
  ('maint_common_bathroom', 'all', 'bathroom', 'Bathrooms', '🚽', ARRAY['Dirty', 'Out of Supplies', 'Broken Fixtures', 'Clogged'], 10),
  ('maint_common_water', 'all', 'water_fountain', 'Water Fountain', '🚰', ARRAY['Not Working', 'Leaking', 'Dirty'], 11),
  ('maint_common_bench', 'all', 'bench', 'Benches/Seating', '🪑', ARRAY['Broken', 'Dirty', 'Missing'], 12),
  ('maint_common_parking', 'all', 'parking', 'Parking', '🅿️', ARRAY['Potholes', 'Faded Lines', 'Broken Gate'], 13),
  ('maint_common_lighting', 'all', 'general_lighting', 'General Lighting', '💡', ARRAY['Burnt Out', 'Flickering', 'Too Dim'], 14)
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- SUCCESS!
-- ========================================

SELECT 'Facility Reporting System created successfully!' as message;
SELECT COUNT(*) as "Total Badges" FROM reporter_badges;
SELECT COUNT(*) as "Maintenance Categories" FROM maintenance_categories;


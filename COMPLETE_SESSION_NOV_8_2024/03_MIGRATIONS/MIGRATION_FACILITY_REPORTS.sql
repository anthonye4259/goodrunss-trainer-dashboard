-- ========================================
-- FACILITY REPORTING & GAMIFICATION SYSTEM
-- Run this to add all facility reporting tables
-- ========================================

-- Facility condition reports (traffic, crowd, skill level, etc.)
CREATE TABLE IF NOT EXISTS facility_reports (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "facilityId" TEXT NOT NULL,
  
  -- Location details
  sport TEXT NOT NULL,
  "specificLocation" TEXT,
  
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
  photos TEXT[],
  videos TEXT[],
  
  -- Engagement
  "helpfulVotes" INTEGER NOT NULL DEFAULT 0,
  "notHelpfulVotes" INTEGER NOT NULL DEFAULT 0,
  confirmations INTEGER NOT NULL DEFAULT 0,
  
  -- Rewards
  "rewardAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "bonusAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "streakMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
  
  -- Metadata
  "reportQuality" INTEGER, -- 1-5 stars
  "isVerified" BOOLEAN NOT NULL DEFAULT false,
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
  "specificLocation" TEXT,
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
  confirmations INTEGER NOT NULL DEFAULT 0,
  "helpfulVotes" INTEGER NOT NULL DEFAULT 0,
  
  -- Rewards
  "rewardAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "bonusAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  
  -- Facility response
  "facilityNotes" TEXT,
  "estimatedFixDate" TIMESTAMP(3),
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
  "totalReports" INTEGER NOT NULL DEFAULT 0,
  "facilityReports" INTEGER NOT NULL DEFAULT 0,
  "maintenanceReports" INTEGER NOT NULL DEFAULT 0,
  
  -- Streaks
  "currentStreak" INTEGER NOT NULL DEFAULT 0,
  "longestStreak" INTEGER NOT NULL DEFAULT 0,
  "lastReportDate" DATE,
  
  -- Earnings
  "totalEarned" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "totalBonuses" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "pendingCredits" DOUBLE PRECISION NOT NULL DEFAULT 0,
  
  -- Quality metrics
  "averageQuality" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "helpfulVotesReceived" INTEGER NOT NULL DEFAULT 0,
  "confirmationsReceived" INTEGER NOT NULL DEFAULT 0,
  
  -- Level & XP
  level INTEGER NOT NULL DEFAULT 1,
  xp INTEGER NOT NULL DEFAULT 0,
  
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
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- User badges (earned)
CREATE TABLE IF NOT EXISTS user_badges (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "badgeId" TEXT NOT NULL,
  "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  progress JSONB,
  
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
  "cashReward" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "creditReward" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "badgeReward" TEXT, -- badge ID
  
  -- Schedule
  "startDate" TIMESTAMP(3) NOT NULL,
  "endDate" TIMESTAMP(3) NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- User challenge progress
CREATE TABLE IF NOT EXISTS user_challenges (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "challengeId" TEXT NOT NULL,
  progress JSONB NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  "completedAt" TIMESTAMP(3),
  claimed BOOLEAN NOT NULL DEFAULT false,
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
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX IF NOT EXISTS "maintenance_categories_sport_idx" ON maintenance_categories(sport);

-- ========================================
-- SEED DATA: BADGES
-- ========================================

INSERT INTO reporter_badges (id, name, "displayName", description, icon, category, requirement, rarity, "sortOrder") VALUES
  -- Milestone badges
  ('badge_first_report', 'first_report', '🌱 First Report', 'Submit your first facility report', '🌱', 'milestone', '{"totalReports": 1}'::jsonb, 'common', 1),
  ('badge_active_reporter', 'active_reporter', '📊 Active Reporter', 'Submit 10 reports', '📊', 'milestone', '{"totalReports": 10}'::jsonb, 'common', 2),
  ('badge_contributor', 'contributor', '🌟 Contributor', 'Submit 25 reports', '🌟', 'milestone', '{"totalReports": 25}'::jsonb, 'uncommon', 3),
  ('badge_expert', 'expert', '⭐ Expert', 'Submit 50 reports', '⭐', 'milestone', '{"totalReports": 50}'::jsonb, 'rare', 4),
  ('badge_master', 'master', '💎 Master', 'Submit 100 reports', '💎', 'milestone', '{"totalReports": 100}'::jsonb, 'epic', 5),
  ('badge_legend', 'legend', '👑 Legend', 'Submit 250 reports', '👑', 'milestone', '{"totalReports": 250}'::jsonb, 'legendary', 6),
  ('badge_elite_scout', 'elite_scout', '🏆 Elite Scout', 'Submit 500 reports', '🏆', 'milestone', '{"totalReports": 500}'::jsonb, 'legendary', 7),
  
  -- Maintenance badges
  ('badge_first_maintenance', 'first_maintenance', '🔧 First Fix', 'Report your first maintenance issue', '🔧', 'maintenance', '{"maintenanceReports": 1}'::jsonb, 'common', 10),
  ('badge_maintenance_helper', 'maintenance_helper', '🏗️ Maintenance Helper', 'Report 10 maintenance issues', '🏗️', 'maintenance', '{"maintenanceReports": 10}'::jsonb, 'uncommon', 11),
  ('badge_facility_guardian', 'facility_guardian', '🦸 Facility Guardian', 'Report 50 maintenance issues', '🦸', 'maintenance', '{"maintenanceReports": 50}'::jsonb, 'epic', 12),
  ('badge_maintenance_master', 'maintenance_master', '🏆 Maintenance Master', 'Report 200 maintenance issues', '🏆', 'maintenance', '{"maintenanceReports": 200}'::jsonb, 'legendary', 13),
  
  -- Streak badges
  ('badge_streak_master', 'streak_master', '🔥 Streak Master', 'Maintain a 30-day reporting streak', '🔥', 'special', '{"currentStreak": 30}'::jsonb, 'epic', 20),
  ('badge_dedicated', 'dedicated', '💪 Dedicated', 'Maintain a 7-day streak', '💪', 'special', '{"currentStreak": 7}'::jsonb, 'uncommon', 21),
  
  -- Quality badges
  ('badge_helpful', 'helpful', '👍 Helpful Reporter', 'Receive 50 helpful votes', '👍', 'special', '{"helpfulVotes": 50}'::jsonb, 'rare', 30),
  ('badge_verified', 'verified', '✅ Verified Reporter', 'Have 25 reports confirmed by others', '✅', 'special', '{"confirmations": 25}'::jsonb, 'rare', 31)

ON CONFLICT (name) DO UPDATE SET
  "displayName" = EXCLUDED."displayName",
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  requirement = EXCLUDED.requirement,
  rarity = EXCLUDED.rarity;

-- ========================================
-- SEED DATA: MAINTENANCE CATEGORIES
-- ========================================

-- Tennis
INSERT INTO maintenance_categories (id, sport, category, "displayName", icon, "commonIssues", "sortOrder") VALUES
  ('maint_tennis_net', 'tennis', 'net', 'Net Issues', '🎾', ARRAY['Net torn', 'Net sagging', 'Net missing', 'Net posts damaged'], 1),
  ('maint_tennis_surface', 'tennis', 'surface', 'Court Surface', '🏐', ARRAY['Cracks', 'Holes', 'Uneven surface', 'Debris'], 2),
  ('maint_tennis_lines', 'tennis', 'lines', 'Court Lines', '📏', ARRAY['Faded lines', 'Peeling lines', 'Missing lines'], 3),
  ('maint_tennis_lighting', 'tennis', 'lighting', 'Lighting', '💡', ARRAY['Burnt out', 'Flickering', 'Too dim', 'Broken fixture'], 4),
  ('maint_tennis_fence', 'tennis', 'fence', 'Fence/Windscreen', '🚧', ARRAY['Holes in fence', 'Windscreen torn', 'Gate broken'], 5),
  ('maint_tennis_amenities', 'tennis', 'amenities', 'Amenities', '🪑', ARRAY['Broken bench', 'No water fountain', 'Dirty bathroom', 'No supplies'], 6);

-- Pickleball
INSERT INTO maintenance_categories (id, sport, category, "displayName", icon, "commonIssues", "sortOrder") VALUES
  ('maint_pickleball_net', 'pickleball', 'net', 'Net Issues', '🏓', ARRAY['Net torn', 'Net sagging', 'Net missing', 'Posts damaged'], 1),
  ('maint_pickleball_surface', 'pickleball', 'surface', 'Court Surface', '🎾', ARRAY['Cracks', 'Holes', 'Uneven', 'Paint faded'], 2),
  ('maint_pickleball_lines', 'pickleball', 'lines', 'Court Lines', '📏', ARRAY['Faded', 'Peeling', 'Missing'], 3),
  ('maint_pickleball_equipment', 'pickleball', 'equipment', 'Equipment', '🏸', ARRAY['Broken paddles', 'Missing balls', 'Storage damaged'], 4);

-- Basketball
INSERT INTO maintenance_categories (id, sport, category, "displayName", icon, "commonIssues", "sortOrder") VALUES
  ('maint_basketball_rim', 'basketball', 'rim', 'Rim/Hoop', '🏀', ARRAY['Rim bent', 'Net missing', 'Net torn', 'Backboard cracked'], 1),
  ('maint_basketball_surface', 'basketball', 'surface', 'Court Surface', '🏐', ARRAY['Cracks', 'Holes', 'Uneven'], 2),
  ('maint_basketball_lines', 'basketball', 'lines', 'Court Lines', '📏', ARRAY['Faded', 'Missing'], 3);

-- Golf
INSERT INTO maintenance_categories (id, sport, category, "displayName", icon, "commonIssues", "sortOrder") VALUES
  ('maint_golf_tee', 'golf', 'tee_box', 'Tee Box', '⛳', ARRAY['Damaged', 'Uneven', 'Poor turf'], 1),
  ('maint_golf_green', 'golf', 'green', 'Green', '🏌️', ARRAY['Damaged', 'Bare spots', 'Uneven', 'Needs mowing'], 2),
  ('maint_golf_bunker', 'golf', 'bunker', 'Bunker', '⛱️', ARRAY['Needs raking', 'Sand quality poor', 'Edges damaged'], 3),
  ('maint_golf_fairway', 'golf', 'fairway', 'Fairway', '🌱', ARRAY['Divots', 'Bare spots', 'Needs mowing'], 4),
  ('maint_golf_equipment', 'golf', 'equipment', 'Equipment', '🏌️', ARRAY['Ball washer empty', 'Ball washer broken', 'Yardage markers missing'], 5);

-- Yoga/Pilates/Barre
INSERT INTO maintenance_categories (id, sport, category, "displayName", icon, "commonIssues", "sortOrder") VALUES
  ('maint_yoga_mats', 'yoga', 'mats', 'Mats', '🧘', ARRAY['Worn', 'Torn', 'Dirty', 'Missing'], 1),
  ('maint_yoga_props', 'yoga', 'props', 'Props/Equipment', '🎯', ARRAY['Broken blocks', 'Torn straps', 'Missing equipment'], 2),
  ('maint_yoga_studio', 'yoga', 'studio', 'Studio Space', '🏠', ARRAY['Mirrors dirty/cracked', 'Floor damaged', 'Temperature issues'], 3),
  ('maint_yoga_sound', 'yoga', 'sound', 'Sound System', '🔊', ARRAY['Not working', 'Poor quality', 'Volume issues'], 4);

-- Similar for pilates and barre
INSERT INTO maintenance_categories (id, sport, category, "displayName", icon, "commonIssues", "sortOrder") VALUES
  ('maint_pilates_equipment', 'pilates', 'equipment', 'Equipment', '🏋️', ARRAY['Reformer broken', 'Springs damaged', 'Missing parts'], 1),
  ('maint_pilates_mats', 'pilates', 'mats', 'Mats', '🧘', ARRAY['Worn', 'Torn', 'Dirty'], 2),
  ('maint_barre_equipment', 'barre', 'equipment', 'Barre Equipment', '💃', ARRAY['Barre loose', 'Barre damaged', 'Missing props'], 1),
  ('maint_barre_studio', 'barre', 'studio', 'Studio Space', '🏠', ARRAY['Mirrors damaged', 'Floor issues', 'Temperature control'], 2);

-- ========================================
-- SUCCESS!
-- ========================================

SELECT '✅ Facility reporting system tables created successfully!' as message;
SELECT COUNT(*) as "Reporter Badges" FROM reporter_badges;
SELECT COUNT(*) as "Maintenance Categories" FROM maintenance_categories;


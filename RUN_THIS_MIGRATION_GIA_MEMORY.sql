-- GIA User Memory & Knowledge System
-- Makes GIA remember everything about each user (like ChatGPT/Cursor memory)

-- 1. User memories table (key facts GIA remembers)
CREATE TABLE IF NOT EXISTS gia_user_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  memory_type TEXT NOT NULL,  -- 'preference', 'fact', 'goal', 'habit', 'dislike', 'relationship', 'health', 'schedule'
  category TEXT NOT NULL,  -- 'sports', 'fitness', 'social', 'schedule', 'diet', 'goals', 'skills', 'personal'
  key TEXT NOT NULL,  -- e.g., 'favorite_sport', 'skill_level', 'plays_with'
  value TEXT NOT NULL,  -- The actual information
  confidence DECIMAL(3,2) DEFAULT 1.00,  -- How sure GIA is (0.0 to 1.0)
  source TEXT,  -- 'explicit' (user told), 'inferred' (GIA figured out), 'observed' (from activity)
  importance INTEGER DEFAULT 5,  -- 1-10 scale
  last_mentioned TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. User preferences table
CREATE TABLE IF NOT EXISTS gia_user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  
  -- Sports preferences
  favorite_sports JSONB DEFAULT '[]',  -- ['tennis', 'pickleball']
  skill_levels JSONB DEFAULT '{}',  -- {'tennis': 'intermediate', 'pickleball': 'beginner'}
  playing_style TEXT,  -- 'competitive', 'casual', 'fitness', 'social'
  
  -- Schedule preferences
  preferred_times JSONB DEFAULT '[]',  -- ['morning', 'evening']
  preferred_days JSONB DEFAULT '[]',  -- ['weekday', 'weekend']
  usual_duration INTEGER,  -- minutes
  
  -- Social preferences
  prefers_group_play BOOLEAN,
  prefers_same_skill BOOLEAN,
  open_to_new_partners BOOLEAN,
  
  -- Facility preferences
  favorite_facilities JSONB DEFAULT '[]',
  preferred_court_types JSONB DEFAULT '[]',  -- ['indoor', 'outdoor']
  max_travel_time INTEGER,  -- minutes
  
  -- Budget preferences
  budget_range TEXT,  -- 'economy', 'standard', 'premium'
  values_quality BOOLEAN DEFAULT true,
  
  -- Fitness preferences
  fitness_goals JSONB DEFAULT '[]',
  workout_frequency TEXT,
  intensity_preference TEXT,  -- 'light', 'moderate', 'intense'
  
  -- Communication preferences
  preferred_notification_time TEXT,
  communication_style TEXT,  -- 'brief', 'detailed', 'friendly', 'professional'
  language_preference TEXT DEFAULT 'en',
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. User activity patterns (what GIA observes)
CREATE TABLE IF NOT EXISTS gia_activity_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  pattern_type TEXT NOT NULL,  -- 'booking', 'cancellation', 'social', 'performance', 'location'
  pattern_data JSONB NOT NULL,
  frequency TEXT,  -- 'daily', 'weekly', 'monthly', 'occasional', 'rare'
  confidence DECIMAL(3,2) DEFAULT 1.00,
  first_observed TIMESTAMP DEFAULT NOW(),
  last_observed TIMESTAMP DEFAULT NOW(),
  observation_count INTEGER DEFAULT 1
);

-- 4. User context (current state)
CREATE TABLE IF NOT EXISTS gia_user_context (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  
  -- Current goals
  current_goals JSONB DEFAULT '[]',
  active_challenges JSONB DEFAULT '[]',
  
  -- Recent activity
  last_booking_date TIMESTAMP,
  last_sport_played TEXT,
  last_facility_visited TEXT,
  recent_partners JSONB DEFAULT '[]',
  
  -- Current state
  energy_level TEXT,  -- 'low', 'medium', 'high'
  injury_status JSONB DEFAULT '{}',
  equipment_needs JSONB DEFAULT '[]',
  
  -- Learning/improvement
  working_on JSONB DEFAULT '[]',  -- Skills they're practicing
  recent_improvements JSONB DEFAULT '[]',
  areas_for_growth JSONB DEFAULT '[]',
  
  -- Social context
  playing_partners JSONB DEFAULT '[]',
  friend_connections JSONB DEFAULT '[]',
  trainer_relationships JSONB DEFAULT '[]',
  
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. Conversation context (what was discussed)
CREATE TABLE IF NOT EXISTS gia_conversation_context (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  conversation_id TEXT,
  
  topics_discussed JSONB DEFAULT '[]',
  entities_mentioned JSONB DEFAULT '{}',  -- {'facilities': [], 'people': [], 'dates': []}
  decisions_made JSONB DEFAULT '[]',
  questions_asked JSONB DEFAULT '[]',
  sentiment TEXT,  -- 'positive', 'neutral', 'negative', 'frustrated', 'excited'
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- 6. User relationships (who they play with, know, avoid)
CREATE TABLE IF NOT EXISTS gia_user_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  related_user_id TEXT NOT NULL,
  relationship_type TEXT NOT NULL,  -- 'friend', 'regular_partner', 'rival', 'avoid', 'trainer', 'mentor'
  strength INTEGER DEFAULT 5,  -- 1-10 scale
  notes TEXT,
  last_interaction TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 7. User life events (important moments to remember)
CREATE TABLE IF NOT EXISTS gia_user_life_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  event_type TEXT NOT NULL,  -- 'milestone', 'achievement', 'injury', 'vacation', 'tournament', 'life_change'
  event_description TEXT NOT NULL,
  event_date DATE,
  impact TEXT,  -- How this affects their booking/playing
  should_reference BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 8. GIA learning notes (what GIA figures out over time)
CREATE TABLE IF NOT EXISTS gia_learning_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  insight TEXT NOT NULL,
  insight_type TEXT,  -- 'behavioral', 'preference', 'pattern', 'opportunity', 'risk'
  confidence DECIMAL(3,2) DEFAULT 0.50,
  validated BOOLEAN DEFAULT false,
  useful BOOLEAN,  -- If this insight helped provide better service
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for fast retrieval
CREATE INDEX IF NOT EXISTS idx_gia_memories_user ON gia_user_memories(user_id);
CREATE INDEX IF NOT EXISTS idx_gia_memories_type ON gia_user_memories(memory_type, user_id);
CREATE INDEX IF NOT EXISTS idx_gia_memories_category ON gia_user_memories(category, user_id);
CREATE INDEX IF NOT EXISTS idx_gia_preferences_user ON gia_user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_gia_patterns_user ON gia_activity_patterns(user_id);
CREATE INDEX IF NOT EXISTS idx_gia_context_user ON gia_user_context(user_id);
CREATE INDEX IF NOT EXISTS idx_gia_conversations_user ON gia_conversation_context(user_id);
CREATE INDEX IF NOT EXISTS idx_gia_relationships_user ON gia_user_relationships(user_id);
CREATE INDEX IF NOT EXISTS idx_gia_events_user ON gia_user_life_events(user_id);
CREATE INDEX IF NOT EXISTS idx_gia_learning_user ON gia_learning_notes(user_id);

-- Function to update memory importance based on frequency of mention
CREATE OR REPLACE FUNCTION update_memory_importance()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE gia_user_memories
  SET 
    importance = LEAST(importance + 1, 10),
    last_mentioned = NOW(),
    updated_at = NOW()
  WHERE user_id = NEW.user_id
    AND key = NEW.key
    AND id != NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update importance
DROP TRIGGER IF EXISTS trigger_update_memory_importance ON gia_user_memories;
CREATE TRIGGER trigger_update_memory_importance
  AFTER INSERT ON gia_user_memories
  FOR EACH ROW
  EXECUTE FUNCTION update_memory_importance();

-- Verify tables created
SELECT table_name 
FROM information_schema.tables 
WHERE table_name LIKE 'gia_%'
ORDER BY table_name;


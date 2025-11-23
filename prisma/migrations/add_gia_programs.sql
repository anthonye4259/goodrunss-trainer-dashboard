-- GIA Generated Programs/Lesson Plans
CREATE TABLE IF NOT EXISTS gia_programs (
  id TEXT PRIMARY KEY,
  instructor_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL, -- 'lesson_plan', 'workout_program', 'class_sequence', 'drill_progression'
  sport_category TEXT, -- 'pickleball', 'yoga', 'tennis', 'pilates', 'performance', etc.
  difficulty_level TEXT, -- 'beginner', 'intermediate', 'advanced'
  duration_minutes INTEGER,
  content JSONB NOT NULL, -- Structured program data
  gia_prompt TEXT, -- Original prompt that generated it
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_favorite BOOLEAN DEFAULT FALSE,
  times_used INTEGER DEFAULT 0,
  FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_gia_programs_instructor ON gia_programs(instructor_id);
CREATE INDEX idx_gia_programs_type ON gia_programs(type);
CREATE INDEX idx_gia_programs_sport ON gia_programs(sport_category);
CREATE INDEX idx_gia_programs_created ON gia_programs(created_at DESC);

-- GIA Program Usage Tracking
CREATE TABLE IF NOT EXISTS gia_program_usage (
  id TEXT PRIMARY KEY,
  program_id TEXT NOT NULL,
  instructor_id TEXT NOT NULL,
  student_id TEXT,
  used_at TIMESTAMP DEFAULT NOW(),
  feedback TEXT,
  rating INTEGER, -- 1-5 stars
  FOREIGN KEY (program_id) REFERENCES gia_programs(id) ON DELETE CASCADE,
  FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_program_usage_program ON gia_program_usage(program_id);
CREATE INDEX idx_program_usage_instructor ON gia_program_usage(instructor_id);


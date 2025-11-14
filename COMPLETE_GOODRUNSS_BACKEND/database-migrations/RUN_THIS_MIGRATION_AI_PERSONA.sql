-- AI Persona System Migration
-- Run this in your Supabase SQL editor or via Prisma

-- AI Personas Table
CREATE TABLE IF NOT EXISTS "ai_personas" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "trainerId" TEXT NOT NULL UNIQUE,
  
  -- Basic Info
  "name" TEXT NOT NULL,
  "tagline" TEXT,
  "bio" TEXT,
  "avatarUrl" TEXT,
  
  -- Voice & Video
  "voiceFileUrl" TEXT,
  "voiceSampleText" TEXT,
  "videoUrl" TEXT,
  
  -- Teaching Style & Traits
  "teachingStyle" TEXT NOT NULL DEFAULT 'motivational',
  "personality" JSONB NOT NULL DEFAULT '{"motivational": 5, "empathetic": 5, "technical": 5, "humorous": 5}'::jsonb,
  "specialties" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "certifications" TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Pricing & Availability
  "pricePerSession" DECIMAL(10,2) NOT NULL DEFAULT 0.30,
  "isActive" BOOLEAN NOT NULL DEFAULT false,
  "isDiscoverable" BOOLEAN NOT NULL DEFAULT true,
  
  -- Stats
  "totalSessions" INTEGER NOT NULL DEFAULT 0,
  "totalEarnings" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "averageRating" DECIMAL(3,2) DEFAULT 0,
  "totalRatings" INTEGER NOT NULL DEFAULT 0,
  
  -- ElevenLabs Integration
  "elevenLabsVoiceId" TEXT,
  "elevenLabsModelUrl" TEXT,
  
  -- Metadata
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "publishedAt" TIMESTAMP
);

-- AI Persona Sessions Table
CREATE TABLE IF NOT EXISTS "ai_persona_sessions" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "personaId" TEXT NOT NULL REFERENCES "ai_personas"("id") ON DELETE CASCADE,
  "playerId" TEXT NOT NULL,
  
  -- Session Details
  "duration" INTEGER NOT NULL DEFAULT 0,
  "messageCount" INTEGER NOT NULL DEFAULT 0,
  "conversationData" JSONB,
  
  -- Pricing
  "cost" DECIMAL(10,2) NOT NULL DEFAULT 0.30,
  "trainerEarnings" DECIMAL(10,2) NOT NULL DEFAULT 0.30,
  
  -- Payment
  "paymentStatus" TEXT NOT NULL DEFAULT 'pending',
  "stripePaymentId" TEXT,
  "paidAt" TIMESTAMP,
  
  -- Metadata
  "startedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "endedAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- AI Persona Feedback Table
CREATE TABLE IF NOT EXISTS "ai_persona_feedback" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "personaId" TEXT NOT NULL REFERENCES "ai_personas"("id") ON DELETE CASCADE,
  "playerId" TEXT NOT NULL,
  "sessionId" TEXT,
  
  -- Feedback
  "rating" INTEGER NOT NULL CHECK ("rating" >= 1 AND "rating" <= 5),
  "comment" TEXT,
  "isHelpful" BOOLEAN,
  "accuracyRating" INTEGER CHECK ("accuracyRating" IS NULL OR ("accuracyRating" >= 1 AND "accuracyRating" <= 5)),
  
  -- Metadata
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- AI Persona Earnings Table
CREATE TABLE IF NOT EXISTS "ai_persona_earnings" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "personaId" TEXT NOT NULL REFERENCES "ai_personas"("id") ON DELETE CASCADE,
  "trainerId" TEXT NOT NULL,
  
  -- Earnings Details
  "amount" DECIMAL(10,2) NOT NULL DEFAULT 0.30,
  "sessionCount" INTEGER NOT NULL DEFAULT 1,
  "date" TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Payout Status
  "payoutStatus" TEXT NOT NULL DEFAULT 'pending',
  "payoutId" TEXT,
  "paidAt" TIMESTAMP,
  
  -- Metadata
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create Indexes for Performance
CREATE INDEX IF NOT EXISTS "idx_ai_personas_trainerId" ON "ai_personas"("trainerId");
CREATE INDEX IF NOT EXISTS "idx_ai_personas_isActive" ON "ai_personas"("isActive");
CREATE INDEX IF NOT EXISTS "idx_ai_personas_isDiscoverable" ON "ai_personas"("isDiscoverable");

CREATE INDEX IF NOT EXISTS "idx_ai_persona_sessions_personaId" ON "ai_persona_sessions"("personaId");
CREATE INDEX IF NOT EXISTS "idx_ai_persona_sessions_playerId" ON "ai_persona_sessions"("playerId");
CREATE INDEX IF NOT EXISTS "idx_ai_persona_sessions_paymentStatus" ON "ai_persona_sessions"("paymentStatus");
CREATE INDEX IF NOT EXISTS "idx_ai_persona_sessions_startedAt" ON "ai_persona_sessions"("startedAt");

CREATE INDEX IF NOT EXISTS "idx_ai_persona_feedback_personaId" ON "ai_persona_feedback"("personaId");
CREATE INDEX IF NOT EXISTS "idx_ai_persona_feedback_playerId" ON "ai_persona_feedback"("playerId");
CREATE INDEX IF NOT EXISTS "idx_ai_persona_feedback_rating" ON "ai_persona_feedback"("rating");

CREATE INDEX IF NOT EXISTS "idx_ai_persona_earnings_personaId" ON "ai_persona_earnings"("personaId");
CREATE INDEX IF NOT EXISTS "idx_ai_persona_earnings_trainerId" ON "ai_persona_earnings"("trainerId");
CREATE INDEX IF NOT EXISTS "idx_ai_persona_earnings_date" ON "ai_persona_earnings"("date");
CREATE INDEX IF NOT EXISTS "idx_ai_persona_earnings_payoutStatus" ON "ai_persona_earnings"("payoutStatus");

-- Auto-update updatedAt timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ai_personas_updated_at BEFORE UPDATE ON "ai_personas"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_persona_feedback_updated_at BEFORE UPDATE ON "ai_persona_feedback"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'AI Persona tables created successfully!';
END $$;


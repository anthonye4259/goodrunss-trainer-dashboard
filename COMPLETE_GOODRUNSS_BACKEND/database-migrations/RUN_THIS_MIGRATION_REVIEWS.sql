-- =====================================================
-- REVIEWS & RATINGS MIGRATION
-- Run this in Supabase SQL Editor
-- =====================================================

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entity_type VARCHAR(20) NOT NULL, -- facility, trainer
  entity_id UUID NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(100),
  comment TEXT,
  photos JSONB DEFAULT '[]'::jsonb,
  helpful_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, entity_type, entity_id)
);

-- Create review helpful marks table
CREATE TABLE IF NOT EXISTS review_helpful (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(review_id, user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_entity ON reviews(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_review_helpful_review_id ON review_helpful(review_id);

-- Function to update helpful count
CREATE OR REPLACE FUNCTION update_review_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE reviews SET helpful_count = helpful_count + 1 WHERE id = NEW.review_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE reviews SET helpful_count = helpful_count - 1 WHERE id = OLD.review_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_review_helpful_count_trigger ON review_helpful;
CREATE TRIGGER update_review_helpful_count_trigger
  AFTER INSERT OR DELETE ON review_helpful
  FOR EACH ROW
  EXECUTE FUNCTION update_review_helpful_count();

-- Function to update facility/trainer average rating
CREATE OR REPLACE FUNCTION update_entity_rating()
RETURNS TRIGGER AS $$
DECLARE
  avg_rating DECIMAL(3,2);
  total_reviews INT;
BEGIN
  -- Calculate new average rating
  SELECT 
    ROUND(AVG(rating)::numeric, 2),
    COUNT(*)
  INTO avg_rating, total_reviews
  FROM reviews
  WHERE entity_type = NEW.entity_type AND entity_id = NEW.entity_id;
  
  -- Update facility rating
  IF NEW.entity_type = 'facility' THEN
    UPDATE facilities
    SET 
      rating = avg_rating,
      review_count = total_reviews
    WHERE id = NEW.entity_id;
  END IF;
  
  -- Update trainer rating (assuming trainers table exists)
  IF NEW.entity_type = 'trainer' THEN
    UPDATE users
    SET 
      rating = avg_rating,
      total_reviews = total_reviews
    WHERE id = NEW.entity_id AND role = 'trainer';
  END IF;
  
  -- Update user stats
  UPDATE user_stats
  SET 
    total_reviews = (SELECT COUNT(*) FROM reviews WHERE user_id = NEW.user_id),
    average_rating = (SELECT ROUND(AVG(rating)::numeric, 2) FROM reviews WHERE user_id = NEW.user_id)
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_entity_rating_trigger ON reviews;
CREATE TRIGGER update_entity_rating_trigger
  AFTER INSERT OR UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_entity_rating();

-- Add rating fields to facilities (if not exists)
ALTER TABLE facilities
ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS review_count INT DEFAULT 0;

-- Add rating fields to users table (for trainers)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_reviews INT DEFAULT 0;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================


-- Add Wellness Facilities to OSM Scraper
-- Run this in Supabase SQL Editor

-- Add Yoga Studios
INSERT INTO facility_sport_mappings (
  sport, 
  display_name, 
  osm_tags, 
  google_types, 
  category
)
VALUES (
  'yoga',
  'Yoga Studios',
  '{"leisure": "fitness_centre", "sport": "yoga"}',
  '["gym", "spa"]',
  'studio'
)
ON CONFLICT (sport) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  osm_tags = EXCLUDED.osm_tags,
  google_types = EXCLUDED.google_types,
  category = EXCLUDED.category;

-- Add Pilates Studios  
INSERT INTO facility_sport_mappings (
  sport,
  display_name,
  osm_tags,
  google_types,
  category
)
VALUES (
  'pilates',
  'Pilates Studios',
  '{"leisure": "fitness_centre", "sport": "pilates"}',
  '["gym", "spa"]',
  'studio'
)
ON CONFLICT (sport) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  osm_tags = EXCLUDED.osm_tags,
  google_types = EXCLUDED.google_types,
  category = EXCLUDED.category;

-- Add Barre Studios
INSERT INTO facility_sport_mappings (
  sport,
  display_name,
  osm_tags,
  google_types,
  category
)
VALUES (
  'barre',
  'Barre Studios',
  '{"leisure": "fitness_centre", "sport": "barre"}',
  '["gym", "spa"]',
  'studio'
)
ON CONFLICT (sport) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  osm_tags = EXCLUDED.osm_tags,
  google_types = EXCLUDED.google_types,
  category = EXCLUDED.category;

-- Verify insertions
SELECT sport, display_name, category FROM facility_sport_mappings 
WHERE category = 'studio'
ORDER BY sport;


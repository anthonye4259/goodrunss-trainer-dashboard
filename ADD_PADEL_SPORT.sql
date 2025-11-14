-- Add Padel to facility_sport_mappings

INSERT INTO facility_sport_mappings (id, sport, osm_tags, google_types, keywords, created_at) 
VALUES (
  'map_padel', 
  'padel', 
  '{"sport": "padel", "leisure": "pitch"}'::jsonb, 
  ARRAY['padel_court'], 
  ARRAY['padel', 'court', 'pádel'], 
  NOW()
);

-- Verify it was added
SELECT * FROM facility_sport_mappings WHERE sport = 'padel';


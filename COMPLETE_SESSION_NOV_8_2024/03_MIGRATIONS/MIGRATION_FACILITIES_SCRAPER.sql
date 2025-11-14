-- ========================================
-- FACILITIES DATABASE & SCRAPER SYSTEM
-- Stores millions of facilities worldwide
-- ========================================

-- Main facilities table
CREATE TABLE IF NOT EXISTS facilities (
  id TEXT PRIMARY KEY,
  
  -- Basic info
  name TEXT NOT NULL,
  "displayName" TEXT, -- Cleaned up name
  type TEXT NOT NULL, -- tennis, basketball, pickleball, golf, yoga, pilates, barre, etc.
  category TEXT NOT NULL, -- outdoor_court, indoor_court, studio, course, park, etc.
  
  -- Location
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT NOT NULL,
  "postalCode" TEXT,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  "geoPoint" geography(POINT, 4326), -- For PostGIS queries
  
  -- Contact
  phone TEXT,
  email TEXT,
  website TEXT,
  
  -- Details
  description TEXT,
  amenities TEXT[], -- lights, parking, restrooms, etc.
  "surfaceType" TEXT, -- hard, clay, grass, etc.
  "courtCount" INTEGER, -- number of courts/rooms
  indoor BOOLEAN DEFAULT false,
  "isPublic" BOOLEAN DEFAULT true,
  "requiresBooking" BOOLEAN DEFAULT false,
  
  -- Hours (JSON: {monday: "6am-10pm", ...})
  hours JSONB,
  
  -- Pricing
  "priceRange" TEXT, -- free, $, $$, $$$
  "hourlyRate" DOUBLE PRECISION,
  currency TEXT DEFAULT 'USD',
  
  -- Social
  photos TEXT[], -- Array of photo URLs
  rating DOUBLE PRECISION,
  "reviewCount" INTEGER DEFAULT 0,
  "googlePlaceId" TEXT UNIQUE,
  
  -- Source tracking
  source TEXT NOT NULL, -- osm, google, manual, etc.
  "sourceId" TEXT, -- Original ID from source
  "sourceUrl" TEXT,
  "lastSyncedAt" TIMESTAMP(3),
  
  -- Status
  verified BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  
  -- Metadata
  metadata JSONB, -- Flexible field for extra data
  
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS "facilities_type_idx" ON facilities(type);
CREATE INDEX IF NOT EXISTS "facilities_category_idx" ON facilities(category);
CREATE INDEX IF NOT EXISTS "facilities_country_idx" ON facilities(country);
CREATE INDEX IF NOT EXISTS "facilities_city_idx" ON facilities(city);
CREATE INDEX IF NOT EXISTS "facilities_lat_lng_idx" ON facilities(lat, lng);
CREATE INDEX IF NOT EXISTS "facilities_source_idx" ON facilities(source);
CREATE INDEX IF NOT EXISTS "facilities_verified_idx" ON facilities(verified);
CREATE INDEX IF NOT EXISTS "facilities_active_idx" ON facilities(active);

-- Geospatial index (for "facilities near me" queries)
CREATE INDEX IF NOT EXISTS "facilities_geopoint_idx" ON facilities USING GIST("geoPoint");

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS "facilities_type_country_idx" ON facilities(type, country);
CREATE INDEX IF NOT EXISTS "facilities_active_type_idx" ON facilities(active, type);

-- ========================================
-- SCRAPER TRACKING
-- ========================================

CREATE TABLE IF NOT EXISTS scraper_jobs (
  id TEXT PRIMARY KEY,
  
  -- Job details
  type TEXT NOT NULL, -- osm, google_places, update
  sport TEXT, -- tennis, basketball, etc.
  region TEXT, -- worldwide, US, specific city, etc.
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending', -- pending, running, completed, failed
  "startedAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  
  -- Results
  "facilitiesFound" INTEGER DEFAULT 0,
  "facilitiesAdded" INTEGER DEFAULT 0,
  "facilitiesUpdated" INTEGER DEFAULT 0,
  "duplicatesSkipped" INTEGER DEFAULT 0,
  
  -- Error tracking
  error TEXT,
  "errorDetails" JSONB,
  
  -- Metadata
  metadata JSONB,
  
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "scraper_jobs_type_idx" ON scraper_jobs(type);
CREATE INDEX IF NOT EXISTS "scraper_jobs_status_idx" ON scraper_jobs(status);
CREATE INDEX IF NOT EXISTS "scraper_jobs_createdAt_idx" ON scraper_jobs("createdAt");

-- ========================================
-- FACILITY DUPLICATES (for deduplication)
-- ========================================

CREATE TABLE IF NOT EXISTS facility_duplicates (
  id TEXT PRIMARY KEY,
  "facilityId1" TEXT NOT NULL,
  "facilityId2" TEXT NOT NULL,
  
  -- Similarity scores
  "nameMatch" DOUBLE PRECISION,
  "locationDistance" DOUBLE PRECISION, -- meters
  "overallScore" DOUBLE PRECISION,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending', -- pending, merged, ignored
  "mergedInto" TEXT, -- ID of facility kept after merge
  
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY ("facilityId1") REFERENCES facilities(id) ON DELETE CASCADE,
  FOREIGN KEY ("facilityId2") REFERENCES facilities(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "facility_duplicates_facilityId1_idx" ON facility_duplicates("facilityId1");
CREATE INDEX IF NOT EXISTS "facility_duplicates_facilityId2_idx" ON facility_duplicates("facilityId2");
CREATE INDEX IF NOT EXISTS "facility_duplicates_status_idx" ON facility_duplicates(status);

-- ========================================
-- SPORT/TYPE MAPPINGS
-- ========================================

CREATE TABLE IF NOT EXISTS facility_sport_mappings (
  id TEXT PRIMARY KEY,
  sport TEXT UNIQUE NOT NULL, -- tennis, basketball, etc.
  "displayName" TEXT NOT NULL,
  "osmTags" JSONB NOT NULL, -- OSM query tags
  "googleTypes" TEXT[], -- Google Places types
  icon TEXT,
  color TEXT,
  "isActive" BOOLEAN DEFAULT true,
  
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Seed sport mappings
INSERT INTO facility_sport_mappings (id, sport, "displayName", "osmTags", "googleTypes", icon, color) VALUES
  ('sport_tennis', 'tennis', 'Tennis', '{"sport": "tennis", "leisure": "pitch"}'::jsonb, ARRAY['tennis_court'], '🎾', '#00A86B'),
  ('sport_pickleball', 'pickleball', 'Pickleball', '{"sport": "pickleball"}'::jsonb, ARRAY['pickleball_court'], '🏓', '#FFB612'),
  ('sport_basketball', 'basketball', 'Basketball', '{"sport": "basketball", "leisure": "pitch"}'::jsonb, ARRAY['basketball_court'], '🏀', '#FF6B35'),
  ('sport_golf', 'golf', 'Golf', '{"leisure": "golf_course"}'::jsonb, ARRAY['golf_course'], '⛳', '#228B22'),
  ('sport_yoga', 'yoga', 'Yoga', '{"amenity": "yoga"}'::jsonb, ARRAY['yoga_studio', 'gym'], '🧘', '#9B59B6'),
  ('sport_pilates', 'pilates', 'Pilates', '{"sport": "pilates"}'::jsonb, ARRAY['pilates_studio', 'gym'], '🏋️', '#E74C3C'),
  ('sport_barre', 'barre', 'Barre', '{"sport": "fitness"}'::jsonb, ARRAY['gym', 'fitness_center'], '💃', '#F39C12'),
  ('sport_soccer', 'soccer', 'Soccer', '{"sport": "soccer", "leisure": "pitch"}'::jsonb, ARRAY['soccer_field'], '⚽', '#3498DB'),
  ('sport_volleyball', 'volleyball', 'Volleyball', '{"sport": "volleyball"}'::jsonb, ARRAY['volleyball_court'], '🏐', '#E67E22')
ON CONFLICT (sport) DO UPDATE SET
  "displayName" = EXCLUDED."displayName",
  "osmTags" = EXCLUDED."osmTags",
  "googleTypes" = EXCLUDED."googleTypes";

-- ========================================
-- SUCCESS!
-- ========================================

SELECT '✅ Facility scraper database created successfully!' as message;
SELECT COUNT(*) as "Sport Mappings" FROM facility_sport_mappings;


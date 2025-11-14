-- Add columns for scraper credentials

ALTER TABLE facility_integrations 
ADD COLUMN IF NOT EXISTS username TEXT,
ADD COLUMN IF NOT EXISTS password TEXT,
ADD COLUMN IF NOT EXISTS club_url TEXT;

-- Add comment
COMMENT ON COLUMN facility_integrations.username IS 'Username for scraper authentication';
COMMENT ON COLUMN facility_integrations.password IS 'Password for scraper authentication (should be encrypted in production)';
COMMENT ON COLUMN facility_integrations.club_url IS 'Facility URL for scrapers (CourtReserve, GolfNow, etc.)';

-- Verify columns added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'facility_integrations' 
  AND column_name IN ('username', 'password', 'club_url');

-- Should return:
-- username  | text
-- password  | text
-- club_url  | text


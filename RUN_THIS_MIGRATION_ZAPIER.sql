-- Run this in Supabase SQL Editor to add webhook support

-- Add webhook_url column
ALTER TABLE facility_integrations 
ADD COLUMN IF NOT EXISTS webhook_url TEXT;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_facility_integrations_webhook 
ON facility_integrations(facility_id, integration_type, is_active) 
WHERE webhook_url IS NOT NULL;

-- Verify it worked
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'facility_integrations' 
  AND column_name = 'webhook_url';

-- Should return:
-- webhook_url | text | YES


-- Add webhook_url column to facility_integrations table
-- This stores Zapier webhook URLs for outgoing events

ALTER TABLE facility_integrations 
ADD COLUMN IF NOT EXISTS webhook_url TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_facility_integrations_webhook 
ON facility_integrations(facility_id, integration_type, is_active) 
WHERE webhook_url IS NOT NULL;

-- Add comment
COMMENT ON COLUMN facility_integrations.webhook_url IS 'Zapier webhook URL for outgoing events (when bookings are created/updated in GoodRunss)';


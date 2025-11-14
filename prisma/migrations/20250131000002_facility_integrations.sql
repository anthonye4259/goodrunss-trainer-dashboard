-- Google Calendar & Other Integrations Support
-- Migration: 20250131000002_facility_integrations

-- Facility Integrations table
CREATE TABLE IF NOT EXISTS facility_integrations (
    id TEXT PRIMARY KEY,
    facility_id TEXT NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    
    -- Integration type
    type TEXT NOT NULL, -- 'google_calendar', 'mindbody', 'courtreserve', '25live', etc.
    
    -- OAuth tokens (encrypted in production)
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    token_expires_at TIMESTAMP,
    
    -- Sync settings
    sync_interval INTEGER DEFAULT 900, -- seconds (15 min default)
    last_synced_at TIMESTAMP,
    
    -- Webhook settings (for receiving updates from external system)
    webhook_url TEXT,
    webhook_secret TEXT,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(facility_id, type)
);

-- Sync Logs (for debugging and monitoring)
CREATE TABLE IF NOT EXISTS sync_logs (
    id TEXT PRIMARY KEY,
    facility_id TEXT NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    integration_type TEXT NOT NULL,
    
    -- Sync details
    sync_type TEXT NOT NULL, -- 'pull', 'push'
    direction TEXT NOT NULL, -- 'to_goodrunss', 'from_goodrunss'
    
    -- Results
    success BOOLEAN NOT NULL,
    events_synced INTEGER DEFAULT 0,
    events_failed INTEGER DEFAULT 0,
    error_message TEXT,
    
    -- Timing
    started_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP,
    duration_ms INTEGER,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- Update bookings table to support sync tracking
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS external_booking_id TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booked_by TEXT DEFAULT 'goodrunss'; -- 'goodrunss', 'google_calendar', 'mindbody', etc.
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS sync_status TEXT DEFAULT 'synced'; -- 'pending', 'synced', 'failed'
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMP;

-- Update facilities table to support integration metadata
ALTER TABLE facilities ADD COLUMN IF NOT EXISTS integration JSONB DEFAULT '{}'::JSONB;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_facility_integrations_facility ON facility_integrations(facility_id);
CREATE INDEX IF NOT EXISTS idx_facility_integrations_type ON facility_integrations(type);
CREATE INDEX IF NOT EXISTS idx_facility_integrations_active ON facility_integrations(is_active);

CREATE INDEX IF NOT EXISTS idx_sync_logs_facility ON sync_logs(facility_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sync_logs_type ON sync_logs(integration_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_bookings_external_id ON bookings(external_booking_id);
CREATE INDEX IF NOT EXISTS idx_bookings_sync_status ON bookings(sync_status);

-- Trigger to update updated_at
DROP TRIGGER IF EXISTS facility_integrations_updated_at ON facility_integrations;
CREATE TRIGGER facility_integrations_updated_at
    BEFORE UPDATE ON facility_integrations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- ✅ Done! Run this in Supabase to enable Google Calendar integration


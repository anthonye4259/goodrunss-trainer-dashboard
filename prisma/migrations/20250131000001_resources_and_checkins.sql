-- GoodRunss API - Resources & Check-ins Tables
-- Migration: 20250131000001_resources_and_checkins

-- Resources table (courts, rooms, fields, pools, etc.)
CREATE TABLE IF NOT EXISTS resources (
    id TEXT PRIMARY KEY,
    facility_id TEXT NOT NULL,
    
    -- Resource details
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- COURT, ROOM, FIELD, POOL, GYM, STUDIO
    description TEXT,
    capacity INTEGER,
    
    -- Pricing
    hourly_rate DECIMAL(10, 2),
    
    -- Features
    amenities TEXT[],
    floor_plan_url TEXT,
    photos TEXT[],
    
    -- Availability
    is_available BOOLEAN DEFAULT true,
    operating_hours JSONB DEFAULT '{}'::JSONB,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Bookings table (extended from existing trainerSession)
CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY,
    
    -- Location
    facility_id TEXT NOT NULL,
    resource_id TEXT, -- Reference to resources table
    
    -- People
    trainer_id TEXT,
    client_id TEXT,
    client_email TEXT,
    client_name TEXT,
    
    -- Timing
    scheduled_at TIMESTAMP NOT NULL,
    duration INTEGER NOT NULL, -- minutes
    
    -- Details
    type TEXT NOT NULL, -- PERSONAL_TRAINING, GROUP_CLASS, COURT_RENTAL, etc.
    status TEXT DEFAULT 'SCHEDULED', -- SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED
    location TEXT,
    notes TEXT,
    
    -- Payment
    price DECIMAL(10, 2),
    payment_status TEXT DEFAULT 'PENDING', -- PENDING, PAID, REFUNDED
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    cancelled_at TIMESTAMP,
    cancelled_by TEXT,
    cancellation_reason TEXT
);

-- Check-ins table (for real-time PlayGrid tracking)
CREATE TABLE IF NOT EXISTS checkins (
    id TEXT PRIMARY KEY,
    
    -- Location
    facility_id TEXT NOT NULL,
    resource_id TEXT, -- Specific court/room/field
    
    -- User
    user_id TEXT,
    user_email TEXT,
    user_name TEXT,
    
    -- Activity
    activity_type TEXT, -- BASKETBALL, TENNIS, YOGA, etc.
    check_in_time TIMESTAMP NOT NULL,
    check_out_time TIMESTAMP,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::JSONB,
    api_key_id TEXT, -- Which API key created this check-in
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_resources_facility ON resources(facility_id);
CREATE INDEX IF NOT EXISTS idx_resources_type ON resources(type);
CREATE INDEX IF NOT EXISTS idx_resources_available ON resources(is_available);

CREATE INDEX IF NOT EXISTS idx_bookings_facility ON bookings(facility_id);
CREATE INDEX IF NOT EXISTS idx_bookings_resource ON bookings(resource_id);
CREATE INDEX IF NOT EXISTS idx_bookings_trainer ON bookings(trainer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_scheduled ON bookings(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

CREATE INDEX IF NOT EXISTS idx_checkins_facility ON checkins(facility_id);
CREATE INDEX IF NOT EXISTS idx_checkins_resource ON checkins(resource_id);
CREATE INDEX IF NOT EXISTS idx_checkins_time ON checkins(check_in_time DESC);
CREATE INDEX IF NOT EXISTS idx_checkins_user ON checkins(user_id);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS resources_updated_at ON resources;
CREATE TRIGGER resources_updated_at
    BEFORE UPDATE ON resources
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS bookings_updated_at ON bookings;
CREATE TRIGGER bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Sample data for testing
INSERT INTO resources (id, facility_id, name, type, description, capacity, hourly_rate, amenities, is_available) VALUES
('res_court_001', 'facility_test_001', 'Basketball Court 1', 'COURT', 'Full-size indoor basketball court', 10, 50.00, ARRAY['scoreboard', 'air_conditioning']::TEXT[], true),
('res_court_002', 'facility_test_001', 'Tennis Court 1', 'COURT', 'Outdoor tennis court', 4, 30.00, ARRAY['lighting', 'nets']::TEXT[], true),
('res_room_001', 'facility_test_001', 'Yoga Studio', 'ROOM', 'Peaceful yoga studio with mirrors', 20, 75.00, ARRAY['mirrors', 'sound_system', 'mats']::TEXT[], true),
('res_field_001', 'facility_test_001', 'Soccer Field', 'FIELD', 'Full-size outdoor soccer field', 22, 100.00, ARRAY['goals', 'seating', 'lighting']::TEXT[], true);

-- ✅ Done! Run this in Supabase SQL Editor


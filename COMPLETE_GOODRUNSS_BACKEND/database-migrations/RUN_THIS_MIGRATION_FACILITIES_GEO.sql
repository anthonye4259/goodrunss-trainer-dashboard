-- =====================================================
-- FACILITIES GEOLOCATION & BOOKING FIELDS MIGRATION
-- Run this in Supabase SQL Editor
-- =====================================================

-- Add geolocation to facilities
ALTER TABLE facilities
ADD COLUMN IF NOT EXISTS lat DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS lng DECIMAL(11, 8);

-- Add cancellation fields to bookings
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS refund_id VARCHAR(255);

-- Create index for geolocation queries
CREATE INDEX IF NOT EXISTS idx_facilities_lat_lng ON facilities(lat, lng);

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================


/**
 * 🔄 REALTIME UPDATES - DATABASE MIGRATION
 * 
 * Creates table for persistent real-time updates
 * Run this in Supabase SQL Editor
 */

-- Create realtime_updates table
CREATE TABLE IF NOT EXISTS realtime_updates (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('booking_status', 'waitlist_position', 'availability_changed', 'payment_confirmed', 'new_message', 'booking_reminder')),
  user_id TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_realtime_updates_user_id ON realtime_updates(user_id);
CREATE INDEX IF NOT EXISTS idx_realtime_updates_user_id_created_at ON realtime_updates(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_realtime_updates_user_id_unread ON realtime_updates(user_id, read) WHERE read = FALSE;
CREATE INDEX IF NOT EXISTS idx_realtime_updates_created_at ON realtime_updates(created_at DESC);

-- Auto-cleanup old updates (keep last 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_realtime_updates()
RETURNS void AS $$
BEGIN
  DELETE FROM realtime_updates 
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup (run daily)
-- Note: You'll need to set up a cron job to call this function

-- Grant permissions (adjust as needed for your setup)
-- ALTER TABLE realtime_updates ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can view their own updates" ON realtime_updates FOR SELECT USING (auth.uid() = user_id);

COMMENT ON TABLE realtime_updates IS 'Stores real-time updates for users (bookings, waitlists, payments, etc.)';
COMMENT ON COLUMN realtime_updates.type IS 'Type of update: booking_status, waitlist_position, availability_changed, payment_confirmed, new_message, booking_reminder';
COMMENT ON COLUMN realtime_updates.data IS 'JSON data specific to the update type';
COMMENT ON COLUMN realtime_updates.read IS 'Whether the user has read/consumed this update';


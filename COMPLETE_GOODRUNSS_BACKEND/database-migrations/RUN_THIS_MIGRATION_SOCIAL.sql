-- =====================================================
-- SOCIAL FEATURES MIGRATION
-- Run this in Supabase SQL Editor
-- =====================================================

-- Create friendships table
CREATE TABLE IF NOT EXISTS friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, accepted, blocked
  created_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  
  UNIQUE(user_id, friend_id),
  CHECK (user_id != friend_id)
);

-- Create groups table
CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  avatar_url TEXT,
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_private BOOLEAN DEFAULT false,
  member_count INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create group members table
CREATE TABLE IF NOT EXISTS group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'member', -- owner, admin, member
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(group_id, user_id)
);

-- Create booking participants table
CREATE TABLE IF NOT EXISTS booking_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'invited', -- invited, accepted, declined
  invited_by UUID REFERENCES users(id),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  
  UNIQUE(booking_id, user_id)
);

-- Create activity feed table
CREATE TABLE IF NOT EXISTS activity_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  actor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL, -- booking_created, friend_joined, check_in, review_left, badge_earned
  entity_type VARCHAR(50), -- booking, user, facility, review
  entity_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_friendships_user_id ON friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend_id ON friendships(friend_id);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON friendships(status);
CREATE INDEX IF NOT EXISTS idx_groups_owner_id ON groups(owner_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_booking_participants_booking_id ON booking_participants(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_participants_user_id ON booking_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_feed_user_id ON activity_feed(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_feed_actor_id ON activity_feed(actor_id);
CREATE INDEX IF NOT EXISTS idx_activity_feed_created_at ON activity_feed(created_at DESC);

-- Function to auto-create reciprocal friendship
CREATE OR REPLACE FUNCTION create_reciprocal_friendship()
RETURNS TRIGGER AS $$
BEGIN
  -- When a friendship is accepted, create the reverse relationship
  IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    INSERT INTO friendships (user_id, friend_id, status, accepted_at)
    VALUES (NEW.friend_id, NEW.user_id, 'accepted', NOW())
    ON CONFLICT (user_id, friend_id) DO UPDATE
    SET status = 'accepted', accepted_at = NOW();
    
    -- Update friend counts
    UPDATE user_stats SET total_friends = total_friends + 1 WHERE user_id = NEW.user_id;
    UPDATE user_stats SET total_friends = total_friends + 1 WHERE user_id = NEW.friend_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS reciprocal_friendship_trigger ON friendships;
CREATE TRIGGER reciprocal_friendship_trigger
  AFTER UPDATE ON friendships
  FOR EACH ROW
  EXECUTE FUNCTION create_reciprocal_friendship();

-- Function to update group member count
CREATE OR REPLACE FUNCTION update_group_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE groups SET member_count = member_count + 1 WHERE id = NEW.group_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE groups SET member_count = member_count - 1 WHERE id = OLD.group_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_group_member_count_trigger ON group_members;
CREATE TRIGGER update_group_member_count_trigger
  AFTER INSERT OR DELETE ON group_members
  FOR EACH ROW
  EXECUTE FUNCTION update_group_member_count();

-- Function to create activity feed entry on booking
CREATE OR REPLACE FUNCTION create_booking_activity()
RETURNS TRIGGER AS $$
DECLARE
  friend_record RECORD;
BEGIN
  -- Create activity for all friends of the booking creator
  FOR friend_record IN 
    SELECT friend_id FROM friendships 
    WHERE user_id = NEW.customer_id AND status = 'accepted'
  LOOP
    INSERT INTO activity_feed (user_id, actor_id, activity_type, entity_type, entity_id, metadata)
    VALUES (
      friend_record.friend_id,
      NEW.customer_id,
      'booking_created',
      'booking',
      NEW.id,
      jsonb_build_object(
        'facility_id', NEW.facility_id,
        'start_time', NEW.start_time,
        'end_time', NEW.end_time
      )
    );
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS create_booking_activity_trigger ON bookings;
CREATE TRIGGER create_booking_activity_trigger
  AFTER INSERT ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION create_booking_activity();

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================


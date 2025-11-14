-- =====================================================
-- NOTIFICATIONS MIGRATION
-- Run this in Supabase SQL Editor
-- =====================================================

-- Extend notifications table (assuming it already exists from Firebase)
-- If it doesn't exist, create it
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- booking_confirmed, booking_reminder, friend_request, etc
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- Function to send notification (can be called from triggers)
CREATE OR REPLACE FUNCTION send_notification(
  p_user_id UUID,
  p_type VARCHAR(50),
  p_title VARCHAR(255),
  p_body TEXT,
  p_data JSONB DEFAULT '{}'::jsonb
) RETURNS UUID AS $$
DECLARE
  notification_id UUID;
  user_prefs RECORD;
BEGIN
  -- Get user preferences
  SELECT * INTO user_prefs
  FROM user_preferences
  WHERE user_id = p_user_id;
  
  -- Check if user wants this type of notification
  IF user_prefs IS NULL OR NOT user_prefs.push_notifications THEN
    RETURN NULL;
  END IF;
  
  -- Check specific notification type preferences
  IF p_type = 'booking_confirmed' AND NOT user_prefs.notify_booking_confirmed THEN
    RETURN NULL;
  ELSIF p_type = 'booking_reminder' AND NOT user_prefs.notify_booking_reminder THEN
    RETURN NULL;
  ELSIF p_type = 'booking_cancelled' AND NOT user_prefs.notify_booking_cancelled THEN
    RETURN NULL;
  ELSIF p_type = 'friend_request' AND NOT user_prefs.notify_friend_request THEN
    RETURN NULL;
  ELSIF p_type = 'friend_activity' AND NOT user_prefs.notify_friend_activity THEN
    RETURN NULL;
  ELSIF p_type = 'referral_signup' AND NOT user_prefs.notify_referral_signup THEN
    RETURN NULL;
  ELSIF p_type = 'credit_earned' AND NOT user_prefs.notify_credit_earned THEN
    RETURN NULL;
  ELSIF p_type = 'challenge' AND NOT user_prefs.notify_challenges THEN
    RETURN NULL;
  END IF;
  
  -- Create notification
  INSERT INTO notifications (user_id, type, title, body, data)
  VALUES (p_user_id, p_type, p_title, p_body, p_data)
  RETURNING id INTO notification_id;
  
  -- TODO: Trigger push notification to device
  -- This would typically be done by an external service or edge function
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to send booking confirmed notification
CREATE OR REPLACE FUNCTION notify_booking_confirmed()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'CONFIRMED' AND (OLD IS NULL OR OLD.status != 'CONFIRMED') THEN
    PERFORM send_notification(
      NEW.customer_id,
      'booking_confirmed',
      'Booking Confirmed',
      'Your booking has been confirmed!',
      jsonb_build_object(
        'booking_id', NEW.id,
        'facility_id', NEW.facility_id,
        'start_time', NEW.start_time,
        'end_time', NEW.end_time
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS notify_booking_confirmed_trigger ON bookings;
CREATE TRIGGER notify_booking_confirmed_trigger
  AFTER INSERT OR UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION notify_booking_confirmed();

-- Trigger to send friend request notification
CREATE OR REPLACE FUNCTION notify_friend_request()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'pending' THEN
    PERFORM send_notification(
      NEW.friend_id,
      'friend_request',
      'New Friend Request',
      'You have a new friend request',
      jsonb_build_object(
        'friendship_id', NEW.id,
        'from_user_id', NEW.user_id
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS notify_friend_request_trigger ON friendships;
CREATE TRIGGER notify_friend_request_trigger
  AFTER INSERT ON friendships
  FOR EACH ROW
  EXECUTE FUNCTION notify_friend_request();

-- Trigger to send referral signup notification
CREATE OR REPLACE FUNCTION notify_referral_signup()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM send_notification(
    NEW.referrer_id,
    'referral_signup',
    'Referral Signup',
    'Someone signed up using your referral code!',
    jsonb_build_object(
      'event_id', NEW.id,
      'credits_earned', NEW.credits_awarded
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS notify_referral_signup_trigger ON referral_events;
CREATE TRIGGER notify_referral_signup_trigger
  AFTER INSERT ON referral_events
  FOR EACH ROW
  WHEN (NEW.event_type = 'signup')
  EXECUTE FUNCTION notify_referral_signup();

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================


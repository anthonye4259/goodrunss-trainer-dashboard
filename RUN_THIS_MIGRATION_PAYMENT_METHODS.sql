-- =====================================================
-- PAYMENT METHODS MIGRATION
-- Run this in Supabase SQL Editor
-- =====================================================

-- Create payment methods table
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_pm_id VARCHAR(255) NOT NULL UNIQUE,
  type VARCHAR(50) DEFAULT 'card', -- card, bank_account
  brand VARCHAR(50), -- visa, mastercard, amex, etc
  last4 VARCHAR(4),
  exp_month INT,
  exp_year INT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_stripe_pm_id ON payment_methods(stripe_pm_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_is_default ON payment_methods(is_default);

-- Function to ensure only one default payment method per user
CREATE OR REPLACE FUNCTION ensure_one_default_payment_method()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = true THEN
    -- Unset all other payment methods as default for this user
    UPDATE payment_methods
    SET is_default = false
    WHERE user_id = NEW.user_id AND id != NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ensure_one_default_payment_method_trigger ON payment_methods;
CREATE TRIGGER ensure_one_default_payment_method_trigger
  BEFORE INSERT OR UPDATE ON payment_methods
  FOR EACH ROW
  EXECUTE FUNCTION ensure_one_default_payment_method();

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================


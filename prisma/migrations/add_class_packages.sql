-- Class Packages (10-class pass, unlimited monthly, etc.)
CREATE TABLE IF NOT EXISTS class_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- e.g., "10-Class Pass", "Unlimited Monthly"
  description TEXT,
  package_type TEXT NOT NULL, -- 'credit_based' or 'unlimited'
  credits INTEGER, -- Number of classes (for credit_based packages)
  duration_days INTEGER, -- Validity period (e.g., 90 days for 10-class pass, 30 for unlimited)
  price DECIMAL(10,2) NOT NULL,
  stripe_price_id TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Client Package Purchases (for CLASS packages specifically)
CREATE TABLE IF NOT EXISTS client_class_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  client_email TEXT NOT NULL, -- For non-registered clients
  trainer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  package_id UUID NOT NULL REFERENCES class_packages(id) ON DELETE RESTRICT,
  package_name TEXT NOT NULL,
  package_type TEXT NOT NULL,
  total_credits INTEGER, -- Original credits
  remaining_credits INTEGER, -- Credits left
  purchased_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP, -- When the package expires
  is_active BOOLEAN DEFAULT true,
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Package Usage Tracking
CREATE TABLE IF NOT EXISTS class_package_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_package_id UUID NOT NULL REFERENCES client_class_packages(id) ON DELETE CASCADE,
  class_booking_id UUID, -- Link to group_class_bookings
  class_id UUID, -- Link to group_classes
  used_at TIMESTAMP DEFAULT NOW(),
  credits_used INTEGER DEFAULT 1
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_class_packages_trainer ON class_packages(trainer_id);
CREATE INDEX IF NOT EXISTS idx_client_class_packages_client ON client_class_packages(client_id);
CREATE INDEX IF NOT EXISTS idx_client_class_packages_email ON client_class_packages(client_email);
CREATE INDEX IF NOT EXISTS idx_client_class_packages_trainer ON client_class_packages(trainer_id);
CREATE INDEX IF NOT EXISTS idx_client_class_packages_active ON client_class_packages(is_active, expires_at);
CREATE INDEX IF NOT EXISTS idx_class_package_usage_client_package ON class_package_usage(client_package_id);

COMMENT ON TABLE class_packages IS 'Package offerings by trainers (10-class pass, unlimited monthly, etc.)';
COMMENT ON TABLE client_class_packages IS 'CLASS packages purchased by clients with credit tracking';
COMMENT ON TABLE class_package_usage IS 'Track when clients use package credits for classes';


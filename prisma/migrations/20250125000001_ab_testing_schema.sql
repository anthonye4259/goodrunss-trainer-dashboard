-- A/B Testing Database Schema
-- Tables for managing A/B tests and tracking conversions

-- Table for A/B tests
CREATE TABLE IF NOT EXISTS ab_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    versions JSONB NOT NULL, -- Array of { id, content, weight }
    target_metric VARCHAR(100) NOT NULL, -- 'booking_started', 'social_share', 'referral'
    traffic_split INTEGER DEFAULT 50, -- Percentage for variant A
    status VARCHAR(20) DEFAULT 'ACTIVE', -- 'ACTIVE', 'COMPLETED', 'ARCHIVED'
    winner VARCHAR(10), -- 'A', 'B', or null
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for tracking user assignments to variants
CREATE TABLE IF NOT EXISTS ab_test_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_name VARCHAR(100) NOT NULL REFERENCES ab_tests(name) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    variant VARCHAR(10) NOT NULL, -- 'A', 'B', 'C', etc.
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(test_name, user_id)
);

-- Table for tracking conversions
CREATE TABLE IF NOT EXISTS ab_test_conversions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_name VARCHAR(100) NOT NULL REFERENCES ab_tests(name) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    variant VARCHAR(10) NOT NULL, -- 'A', 'B', 'C', etc.
    action VARCHAR(100) NOT NULL, -- 'booking_started', 'social_share', 'referral', etc.
    is_target_metric BOOLEAN DEFAULT FALSE,
    metadata JSONB,
    converted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for storing conversion results and statistics
CREATE TABLE IF NOT EXISTS ab_test_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_name VARCHAR(100) NOT NULL REFERENCES ab_tests(name) ON DELETE CASCADE,
    variant VARCHAR(10) NOT NULL, -- 'A', 'B', 'C', etc.
    total_assignments INTEGER DEFAULT 0,
    total_conversions INTEGER DEFAULT 0,
    conversion_rate DECIMAL(10, 2) DEFAULT 0.00,
    lift DECIMAL(10, 2) DEFAULT 0.00, -- Percentage improvement vs baseline
    is_winner BOOLEAN DEFAULT FALSE,
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(test_name, variant)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ab_tests_name ON ab_tests(name);
CREATE INDEX IF NOT EXISTS idx_ab_tests_status ON ab_tests(status);
CREATE INDEX IF NOT EXISTS idx_ab_tests_created_at ON ab_tests(created_at);

CREATE INDEX IF NOT EXISTS idx_ab_test_assignments_test_name ON ab_test_assignments(test_name);
CREATE INDEX IF NOT EXISTS idx_ab_test_assignments_user_id ON ab_test_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_ab_test_assignments_variant ON ab_test_assignments(variant);

CREATE INDEX IF NOT EXISTS idx_ab_test_conversions_test_name ON ab_test_conversions(test_name);
CREATE INDEX IF NOT EXISTS idx_ab_test_conversions_user_id ON ab_test_conversions(user_id);
CREATE INDEX IF NOT EXISTS idx_ab_test_conversions_variant ON ab_test_conversions(variant);
CREATE INDEX IF NOT EXISTS idx_ab_test_conversions_action ON ab_test_conversions(action);
CREATE INDEX IF NOT EXISTS idx_ab_test_conversions_is_target_metric ON ab_test_conversions(is_target_metric);

CREATE INDEX IF NOT EXISTS idx_ab_test_results_test_name ON ab_test_results(test_name);
CREATE INDEX IF NOT EXISTS idx_ab_test_results_variant ON ab_test_results(variant);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_ab_tests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_ab_tests_updated_at 
    BEFORE UPDATE ON ab_tests 
    FOR EACH ROW EXECUTE FUNCTION update_ab_tests_updated_at();

-- Insert sample A/B tests for testing
INSERT INTO ab_tests (name, description, versions, target_metric, traffic_split, status) VALUES
    (
        'booking-button-color',
        'Test different button colors for booking conversion',
        '[
            {"id": "A", "content": "Book Now", "color": "blue"},
            {"id": "B", "content": "Start Your Journey", "color": "green"}
        ]'::jsonb,
        'booking_started',
        50,
        'ACTIVE'
    ),
    (
        'gia-welcome-message',
        'Test different welcome messages for G.I.A',
        '[
            {"id": "A", "message": "Hi! I''m G.I.A. How can I help you today?"},
            {"id": "B", "message": "Hi! I''m G.I.A 🌟 Your AI fitness coach powered by real-time environmental data. Ready to train smarter?"}
        ]'::jsonb,
        'interaction_count',
        50,
        'ACTIVE'
    ),
    (
        'social-share-text',
        'Test different social share text for viral growth',
        '[
            {"id": "A", "text": "I had an amazing yoga session today! 🧘"},
            {"id": "B", "text": "G.I.A told me to do this yoga session today! The AI knows perfect conditions! 🤖"}
        ]'::jsonb,
        'social_share',
        50,
        'ACTIVE'
    )
ON CONFLICT (name) DO NOTHING;

-- Grant permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ab_tests TO your_app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ab_test_assignments TO your_app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ab_test_conversions TO your_app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ab_test_results TO your_app_user;


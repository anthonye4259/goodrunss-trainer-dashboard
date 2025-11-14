-- Viral Growth Database Schema Updates
-- Add new tables for viral content tracking and referral system

-- Table for storing viral content (QR codes, widgets, marketing content, etc.)
CREATE TABLE IF NOT EXISTS viral_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content_type VARCHAR(50) NOT NULL, -- 'marketing_generation', 'qr_code', 'widget', 'workout_recap', 'gia_workout_share', 'workout_share'
    content_data JSONB NOT NULL,
    share_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for tracking referrals and viral growth
CREATE TABLE IF NOT EXISTS referral_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    referred_email VARCHAR(255) NOT NULL,
    source VARCHAR(100) NOT NULL, -- 'instagram', 'tiktok', 'twitter', 'facebook', 'qr_code', 'widget'
    referral_code VARCHAR(100) NOT NULL,
    converted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for tracking viral metrics and analytics
CREATE TABLE IF NOT EXISTS viral_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    metric_type VARCHAR(50) NOT NULL, -- 'share', 'click', 'conversion', 'engagement'
    platform VARCHAR(50) NOT NULL, -- 'instagram', 'tiktok', 'twitter', 'facebook', 'qr_code', 'widget'
    content_id UUID REFERENCES viral_content(id) ON DELETE CASCADE,
    referral_code VARCHAR(100),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for storing G.I.A generated content
CREATE TABLE IF NOT EXISTS gia_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content_type VARCHAR(50) NOT NULL, -- 'marketing', 'workout_plan', 'social_post', 'email_template'
    prompt TEXT NOT NULL,
    generated_content JSONB NOT NULL,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_viral_content_user_id ON viral_content(user_id);
CREATE INDEX IF NOT EXISTS idx_viral_content_type ON viral_content(content_type);
CREATE INDEX IF NOT EXISTS idx_viral_content_created_at ON viral_content(created_at);

CREATE INDEX IF NOT EXISTS idx_referral_tracking_referrer_id ON referral_tracking(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_tracking_code ON referral_tracking(referral_code);
CREATE INDEX IF NOT EXISTS idx_referral_tracking_converted ON referral_tracking(converted);

CREATE INDEX IF NOT EXISTS idx_viral_metrics_user_id ON viral_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_viral_metrics_type ON viral_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_viral_metrics_platform ON viral_metrics(platform);

CREATE INDEX IF NOT EXISTS idx_gia_content_user_id ON gia_content(user_id);
CREATE INDEX IF NOT EXISTS idx_gia_content_type ON gia_content(content_type);

-- Add viral content tracking to existing users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_referrals INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS converted_referrals INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS viral_content_count INTEGER DEFAULT 0;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_viral_content_updated_at 
    BEFORE UPDATE ON viral_content 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_referral_tracking_updated_at 
    BEFORE UPDATE ON referral_tracking 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gia_content_updated_at 
    BEFORE UPDATE ON gia_content 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
INSERT INTO viral_content (user_id, content_type, content_data) VALUES
    ('00000000-0000-0000-0000-000000000001', 'marketing_generation', '{"socialMediaPosts": ["Sample post"], "hashtags": ["#test"]}'),
    ('00000000-0000-0000-0000-000000000001', 'qr_code', '{"qrCodeUrl": "data:image/png;base64,test", "bookingUrl": "https://example.com/book/1"}');

-- Insert sample referral tracking
INSERT INTO referral_tracking (referrer_id, referred_email, source, referral_code) VALUES
    ('00000000-0000-0000-0000-000000000001', 'test@example.com', 'instagram', 'TRAINER_ABC123');

-- Insert sample G.I.A content
INSERT INTO gia_content (user_id, content_type, prompt, generated_content) VALUES
    ('00000000-0000-0000-0000-000000000001', 'marketing', 'Generate marketing content', '{"content": "Sample marketing content"}');

-- Grant permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON viral_content TO your_app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON referral_tracking TO your_app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON viral_metrics TO your_app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON gia_content TO your_app_user;



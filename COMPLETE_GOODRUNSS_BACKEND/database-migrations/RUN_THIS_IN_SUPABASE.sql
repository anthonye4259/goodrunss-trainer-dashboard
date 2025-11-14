-- 🔑 GoodRunss Public API - Database Setup
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard
-- Your project → SQL Editor → New Query → Paste this → Run

-- API Keys table for third-party integrations
CREATE TABLE IF NOT EXISTS api_keys (
    id TEXT PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    
    -- Owner (facility, studio, or developer)
    owner_id TEXT NOT NULL,
    owner_type TEXT NOT NULL DEFAULT 'FACILITY',
    owner_email TEXT NOT NULL,
    
    -- Permissions & Scopes
    scopes TEXT[] DEFAULT ARRAY['read:bookings', 'write:bookings']::TEXT[],
    environment TEXT NOT NULL DEFAULT 'production',
    
    -- Rate Limiting
    rate_limit_per_minute INTEGER DEFAULT 60,
    rate_limit_per_hour INTEGER DEFAULT 1000,
    rate_limit_per_day INTEGER DEFAULT 10000,
    
    -- Status & Security
    is_active BOOLEAN DEFAULT true,
    last_used_at TIMESTAMP,
    expires_at TIMESTAMP,
    
    -- Metadata
    ip_whitelist TEXT[],
    webhook_url TEXT,
    webhook_secret TEXT,
    metadata JSONB DEFAULT '{}'::JSONB,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    revoked_at TIMESTAMP,
    revoked_by TEXT,
    revoked_reason TEXT
);

-- API Request Logs (for rate limiting & analytics)
CREATE TABLE IF NOT EXISTS api_request_logs (
    id TEXT PRIMARY KEY,
    api_key_id TEXT NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,
    
    -- Request details
    method TEXT NOT NULL,
    endpoint TEXT NOT NULL,
    status_code INTEGER NOT NULL,
    response_time_ms INTEGER,
    
    -- Request metadata
    ip_address TEXT,
    user_agent TEXT,
    request_body JSONB,
    response_body JSONB,
    error_message TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW()
);

-- API Usage Stats (aggregated per day)
CREATE TABLE IF NOT EXISTS api_usage_stats (
    id TEXT PRIMARY KEY,
    api_key_id TEXT NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    
    -- Usage metrics
    total_requests INTEGER DEFAULT 0,
    successful_requests INTEGER DEFAULT 0,
    failed_requests INTEGER DEFAULT 0,
    avg_response_time_ms FLOAT DEFAULT 0,
    
    -- Endpoints breakdown
    endpoints_used JSONB DEFAULT '{}'::JSONB,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(api_key_id, date)
);

-- Webhooks table (for event notifications)
CREATE TABLE IF NOT EXISTS webhooks (
    id TEXT PRIMARY KEY,
    api_key_id TEXT NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,
    
    -- Webhook config
    url TEXT NOT NULL,
    secret TEXT NOT NULL,
    events TEXT[] DEFAULT ARRAY['booking.created', 'booking.cancelled']::TEXT[],
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    last_triggered_at TIMESTAMP,
    last_status_code INTEGER,
    failure_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Webhook Events Log
CREATE TABLE IF NOT EXISTS webhook_events (
    id TEXT PRIMARY KEY,
    webhook_id TEXT NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
    
    -- Event details
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    
    -- Delivery status
    status TEXT NOT NULL DEFAULT 'pending',
    attempts INTEGER DEFAULT 0,
    last_attempt_at TIMESTAMP,
    response_status_code INTEGER,
    response_body TEXT,
    error_message TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    delivered_at TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_api_keys_key ON api_keys(key);
CREATE INDEX IF NOT EXISTS idx_api_keys_owner ON api_keys(owner_id, owner_type);
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON api_keys(is_active, expires_at);

CREATE INDEX IF NOT EXISTS idx_api_request_logs_key_id ON api_request_logs(api_key_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_request_logs_endpoint ON api_request_logs(endpoint, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_api_usage_stats_key_date ON api_usage_stats(api_key_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_webhooks_api_key ON webhooks(api_key_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_webhook_id ON webhook_events(webhook_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_events_status ON webhook_events(status, created_at DESC);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_api_keys_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS api_keys_updated_at ON api_keys;
CREATE TRIGGER api_keys_updated_at
    BEFORE UPDATE ON api_keys
    FOR EACH ROW
    EXECUTE FUNCTION update_api_keys_updated_at();

DROP TRIGGER IF EXISTS api_usage_stats_updated_at ON api_usage_stats;
CREATE TRIGGER api_usage_stats_updated_at
    BEFORE UPDATE ON api_usage_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_api_keys_updated_at();

-- ✅ Done! Now restart your dashboard and go to /dashboard/developer


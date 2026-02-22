-- NoxPay Supabase Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. Clients Table
-- ==========================================
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    client_id UUID UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
    secret_hash TEXT NOT NULL,
    webhook_secret TEXT,                -- Dedicated HMAC signing key (plaintext, NOT bcrypt)
    webhook_url TEXT,
    upi_vpa TEXT,                       -- Default UPI VPA for this merchant
    is_active BOOLEAN DEFAULT true,
    rate_limit INT DEFAULT 100,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 2. Payment Intents Table
-- ==========================================
CREATE TABLE payment_intents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    currency TEXT NOT NULL CHECK (currency IN ('UPI', 'USDT')),
    order_id TEXT UNIQUE NOT NULL,
    upi_vpa TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'expired', 'failed')),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 3. Verified Transactions Table
-- ==========================================
CREATE TABLE verified_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_intent_id UUID REFERENCES payment_intents(id) ON DELETE SET NULL,
    utr TEXT UNIQUE, -- Idempotency key for UPI
    amount DECIMAL(12,2) NOT NULL,
    bank_source TEXT,
    tx_hash TEXT, -- For crypto transactions
    metadata JSONB DEFAULT '{}',
    verified_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_verified_transactions_utr ON verified_transactions (utr) WHERE utr IS NOT NULL;
CREATE UNIQUE INDEX idx_verified_transactions_tx_hash ON verified_transactions (tx_hash) WHERE tx_hash IS NOT NULL;

-- ==========================================
-- 4. Webhook Logs Table
-- ==========================================
CREATE TABLE webhook_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    payment_intent_id UUID REFERENCES payment_intents(id) ON DELETE SET NULL,
    url TEXT NOT NULL,
    payload JSONB NOT NULL,
    response_code INT,
    attempts INT DEFAULT 0,
    status TEXT NOT NULL CHECK (status IN ('delivered', 'failed', 'retrying')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 5. Audit Logs Table
-- ==========================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor TEXT NOT NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- Auto-update `updated_at` trigger
-- ==========================================
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp_clients
    BEFORE UPDATE ON clients
    FOR EACH ROW
    EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp_payment_intents
    BEFORE UPDATE ON payment_intents
    FOR EACH ROW
    EXECUTE PROCEDURE trigger_set_timestamp();

-- ==========================================
-- Row Level Security (RLS) Settings
-- ==========================================

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE verified_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for dashboard users (Supabase Auth)
-- Dashboard users see only their own client data
CREATE POLICY "Users can view own client profile"
    ON clients FOR SELECT
    USING (id = auth.uid());

CREATE POLICY "Users can update own client profile"
    ON clients FOR UPDATE
    USING (id = auth.uid());

CREATE POLICY "Users can view own intents"
    ON payment_intents FOR SELECT
    USING (client_id = auth.uid());

CREATE POLICY "Users can view own transactions"
    ON verified_transactions FOR SELECT
    USING (payment_intent_id IN (
        SELECT id FROM payment_intents WHERE client_id = auth.uid()
    ));

CREATE POLICY "Users can view own webhook logs"
    ON webhook_logs FOR SELECT
    USING (client_id = auth.uid());

-- ==========================================
-- Migration SQL (run if upgrading existing DB)
-- ==========================================
-- ALTER TABLE clients ADD COLUMN IF NOT EXISTS webhook_secret TEXT;
-- ALTER TABLE clients ADD COLUMN IF NOT EXISTS upi_vpa TEXT;
-- ALTER TABLE clients ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
-- ALTER TABLE payment_intents ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

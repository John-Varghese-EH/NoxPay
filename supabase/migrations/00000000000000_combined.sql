-- COMBINED MIGRATIONS

-- From 20260301_enhancements.sql
-- Add metadata to payment_intents
ALTER TABLE payment_intents ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Add next_retry_at to webhook_logs for retry logic
ALTER TABLE webhook_logs ADD COLUMN IF NOT EXISTS next_retry_at TIMESTAMPTZ;

-- Index for efficient retry polling
CREATE INDEX IF NOT EXISTS idx_webhook_logs_retry ON webhook_logs (status, next_retry_at) 
WHERE status = 'retrying' AND next_retry_at IS NOT NULL;


-- From 20260301_robustness.sql
-- NoxPay Robustness & Performance Migration
-- Date: 2026-03-01

-- 1. Add indexing for performance
CREATE INDEX IF NOT EXISTS idx_intents_status_client ON payment_intents (status, client_id);
CREATE INDEX IF NOT EXISTS idx_intents_expires_at ON payment_intents (expires_at);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_client_status ON webhook_logs (client_id, status);

-- 2. Add security/config columns to clients
ALTER TABLE clients ADD COLUMN IF NOT EXISTS allowed_ips TEXT[] DEFAULT '{}';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- 3. Add indexing for verified_transactions
CREATE INDEX IF NOT EXISTS idx_verified_tx_payment_intent ON verified_transactions (payment_intent_id);

-- 4. Ensure updated_at triggers exist for new tables if any (all covered for now)


-- From 20260320_checkout_analytics.sql
-- checkout_analytics: tracks visitor device, browser, IP for each payment checkout visit
CREATE TABLE IF NOT EXISTS checkout_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    intent_id UUID NOT NULL REFERENCES payment_intents(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    ip_address TEXT,
    browser TEXT,
    device_type TEXT, -- mobile, tablet, desktop
    os TEXT,
    screen_resolution TEXT,
    language TEXT,
    platform TEXT,
    referrer TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- One analytics record per payment intent (upsert on intent_id)
CREATE UNIQUE INDEX IF NOT EXISTS idx_checkout_analytics_intent ON checkout_analytics(intent_id);

-- Index for dashboard queries
CREATE INDEX IF NOT EXISTS idx_checkout_analytics_client ON checkout_analytics(client_id);

-- RLS: merchants can view analytics for their own projects
ALTER TABLE checkout_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own analytics"
    ON checkout_analytics FOR SELECT
    USING (client_id IN (SELECT id FROM clients WHERE user_id = auth.uid()));

-- Allow service role to insert (from the API route)
CREATE POLICY "Service role can insert analytics"
    ON checkout_analytics FOR INSERT
    WITH CHECK (true);


-- From 20260320_payment_disputes.sql
-- payment_disputes: tracks customer reports of payments made but not reflected
CREATE TABLE IF NOT EXISTS payment_disputes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    intent_id UUID NOT NULL REFERENCES payment_intents(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    order_id TEXT,
    transaction_id TEXT NOT NULL,
    customer_email TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
    amount DECIMAL(12,2),
    currency TEXT,
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_payment_disputes_client ON payment_disputes(client_id);
CREATE INDEX IF NOT EXISTS idx_payment_disputes_intent ON payment_disputes(intent_id);
CREATE INDEX IF NOT EXISTS idx_payment_disputes_status ON payment_disputes(status);

-- RLS: merchants can view disputes for their own projects
ALTER TABLE payment_disputes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own disputes"
    ON payment_disputes FOR SELECT
    USING (client_id IN (SELECT id FROM clients WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own disputes"
    ON payment_disputes FOR UPDATE
    USING (client_id IN (SELECT id FROM clients WHERE user_id = auth.uid()));

-- Service role can insert (from the public API route)
CREATE POLICY "Service role can insert disputes"
    ON payment_disputes FOR INSERT
    WITH CHECK (true);


-- From 20260321_bank_parser_rules.sql
-- Add custom bank email parser rules column to clients table
ALTER TABLE clients ADD COLUMN IF NOT EXISTS bank_parser_rules JSONB DEFAULT '[]';

-- Each element in the array is an object:
-- {
--   "bank_name": "ICICI",
--   "detect_keyword": "icici bank",
--   "amount_regex": "Rs\\.? ?([\\d,]+\\.\\d{2})",
--   "utr_regex": "Ref No[:\\.] ?(\\d{12})",
--   "sender_regex": "from ([\\w\\.\\-]+@\\w+)",       (optional)
--   "remark_regex": "Remark[:\\.] ?([\\w\\-]+)"         (optional)
-- }


-- From 20260321_redirect_url.sql
-- Add per-intent redirect URL support
ALTER TABLE payment_intents ADD COLUMN IF NOT EXISTS redirect_url TEXT;


-- From 20260321_worker_email_logs.sql
-- Worker email processing logs for debugging
CREATE TABLE IF NOT EXISTS worker_email_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now(),
    sender TEXT,
    subject TEXT,
    status TEXT NOT NULL DEFAULT 'received',  -- received, security_rejected, parse_failed, parsed, matched, settle_failed
    parsed_amount NUMERIC,
    parsed_utr TEXT,
    parsed_order_id TEXT,
    parsed_bank TEXT,
    matched_intent_id UUID,
    error_message TEXT,
    body_preview TEXT  -- first 500 chars of email body for debugging
);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_worker_email_logs_created ON worker_email_logs(created_at DESC);

-- Allow service role full access (worker uses service role key)
ALTER TABLE worker_email_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access" ON worker_email_logs FOR ALL USING (true) WITH CHECK (true);

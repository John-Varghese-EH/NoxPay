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

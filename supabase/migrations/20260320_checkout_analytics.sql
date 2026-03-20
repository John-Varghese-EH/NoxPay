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

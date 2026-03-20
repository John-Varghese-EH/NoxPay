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

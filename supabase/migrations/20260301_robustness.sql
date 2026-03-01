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

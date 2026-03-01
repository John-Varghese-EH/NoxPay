-- Add metadata to payment_intents
ALTER TABLE payment_intents ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Add next_retry_at to webhook_logs for retry logic
ALTER TABLE webhook_logs ADD COLUMN IF NOT EXISTS next_retry_at TIMESTAMPTZ;

-- Index for efficient retry polling
CREATE INDEX IF NOT EXISTS idx_webhook_logs_retry ON webhook_logs (status, next_retry_at) 
WHERE status = 'retrying' AND next_retry_at IS NOT NULL;

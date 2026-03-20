-- Add per-intent redirect URL support
ALTER TABLE payment_intents ADD COLUMN IF NOT EXISTS redirect_url TEXT;

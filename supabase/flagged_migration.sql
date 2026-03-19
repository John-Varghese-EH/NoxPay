-- NoxPay: Flagged-for-Review Migration
-- Run this in your Supabase SQL Editor

-- 1. Drop existing CHECK and recreate with flagged status
ALTER TABLE payment_intents DROP CONSTRAINT IF EXISTS payment_intents_status_check;
ALTER TABLE payment_intents ADD CONSTRAINT payment_intents_status_check
    CHECK (status IN ('pending', 'success', 'expired', 'failed', 'flagged'));

-- 2. Add resolution tracking columns
ALTER TABLE payment_intents ADD COLUMN IF NOT EXISTS resolution TEXT CHECK (resolution IN ('approved', 'rejected'));
ALTER TABLE payment_intents ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;
ALTER TABLE payment_intents ADD COLUMN IF NOT EXISTS resolved_by UUID;

-- 3. Allow dashboard users to UPDATE their own payment intents
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own intents' AND tablename = 'payment_intents') THEN
        CREATE POLICY "Users can update own intents"
            ON payment_intents FOR UPDATE
            USING (client_id IN (SELECT id FROM clients WHERE user_id = auth.uid()))
            WITH CHECK (client_id IN (SELECT id FROM clients WHERE user_id = auth.uid()));
    END IF;
END $$;

-- 4. Allow dashboard users to INSERT payment intents for their own clients
-- (Required for Payment Links generation from the dashboard)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own intents' AND tablename = 'payment_intents') THEN
        CREATE POLICY "Users can insert own intents"
            ON payment_intents FOR INSERT
            WITH CHECK (client_id IN (SELECT id FROM clients WHERE user_id = auth.uid()));
    END IF;
END $$;

-- Add TWC order tracking columns to quotes table
ALTER TABLE quotes
ADD COLUMN IF NOT EXISTS twc_order_id text,
ADD COLUMN IF NOT EXISTS twc_order_status text,
ADD COLUMN IF NOT EXISTS twc_submitted_at timestamptz,
ADD COLUMN IF NOT EXISTS twc_response jsonb;

-- Create index for faster TWC order lookups
CREATE INDEX IF NOT EXISTS idx_quotes_twc_order_id ON quotes(twc_order_id) WHERE twc_order_id IS NOT NULL;
-- Add discount and payment columns to quotes table
ALTER TABLE quotes
ADD COLUMN IF NOT EXISTS discount_type text CHECK (discount_type IN ('percentage', 'fixed')),
ADD COLUMN IF NOT EXISTS discount_value numeric(10,2),
ADD COLUMN IF NOT EXISTS discount_scope text CHECK (discount_scope IN ('all', 'fabrics_only', 'selected_items')),
ADD COLUMN IF NOT EXISTS discount_amount numeric(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS selected_discount_items jsonb,
ADD COLUMN IF NOT EXISTS payment_type text CHECK (payment_type IN ('full', 'deposit')),
ADD COLUMN IF NOT EXISTS payment_percentage numeric(5,2),
ADD COLUMN IF NOT EXISTS payment_amount numeric(10,2),
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text,
ADD COLUMN IF NOT EXISTS payment_status text CHECK (payment_status IN ('pending', 'paid', 'failed', 'deposit_paid')) DEFAULT 'pending';

-- Create indexes for faster payment lookups
CREATE INDEX IF NOT EXISTS idx_quotes_payment_status ON quotes(payment_status);
CREATE INDEX IF NOT EXISTS idx_quotes_stripe_payment_intent ON quotes(stripe_payment_intent_id);

-- Add comment for documentation
COMMENT ON COLUMN quotes.discount_type IS 'Type of discount: percentage or fixed amount';
COMMENT ON COLUMN quotes.discount_scope IS 'Scope of discount: all items, fabrics only, or selected items';
COMMENT ON COLUMN quotes.payment_type IS 'Payment type: full payment or deposit';
COMMENT ON COLUMN quotes.payment_status IS 'Payment status: pending, paid, failed, or deposit_paid';
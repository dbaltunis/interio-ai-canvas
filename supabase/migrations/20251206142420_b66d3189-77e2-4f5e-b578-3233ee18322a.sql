-- Add separate document number columns for each entity stage
-- This prevents wasting sequence numbers when swapping statuses back and forth

ALTER TABLE quotes 
ADD COLUMN IF NOT EXISTS draft_number TEXT,
ADD COLUMN IF NOT EXISTS order_number TEXT,
ADD COLUMN IF NOT EXISTS invoice_number TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_quotes_draft_number ON quotes(draft_number) WHERE draft_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_quotes_order_number ON quotes(order_number) WHERE order_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_quotes_invoice_number ON quotes(invoice_number) WHERE invoice_number IS NOT NULL;

-- Add comment explaining the document number strategy
COMMENT ON COLUMN quotes.quote_number IS 'The quote number - generated when status first moves to quote stage';
COMMENT ON COLUMN quotes.draft_number IS 'The draft number - generated when status is draft stage';
COMMENT ON COLUMN quotes.order_number IS 'The order number - generated when status first moves to order stage';
COMMENT ON COLUMN quotes.invoice_number IS 'The invoice number - generated when status first moves to invoice stage';
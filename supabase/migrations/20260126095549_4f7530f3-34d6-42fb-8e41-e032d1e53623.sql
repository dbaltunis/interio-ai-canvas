-- Add supplier_orders JSONB to track multiple supplier orders per quote
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS supplier_orders JSONB DEFAULT '{}';

-- Add index for faster supplier order lookups
CREATE INDEX IF NOT EXISTS idx_quotes_supplier_orders ON quotes USING GIN (supplier_orders) WHERE supplier_orders != '{}';
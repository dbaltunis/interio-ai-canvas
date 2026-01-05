-- Phase 1: Add invoice-specific fields to business_settings and quotes tables

-- Add late payment and invoice settings to business_settings
ALTER TABLE business_settings 
ADD COLUMN IF NOT EXISTS late_payment_interest_rate NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS late_payment_fee_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS payment_reference_prefix TEXT DEFAULT 'INV',
ADD COLUMN IF NOT EXISTS late_payment_terms TEXT;

-- Add invoice-specific fields to quotes table
ALTER TABLE quotes
ADD COLUMN IF NOT EXISTS supply_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS po_number TEXT,
ADD COLUMN IF NOT EXISTS payment_reference TEXT,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid',
ADD COLUMN IF NOT EXISTS amount_paid NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'AUD';

-- Add index for payment status queries
CREATE INDEX IF NOT EXISTS idx_quotes_payment_status ON quotes(payment_status) WHERE payment_status IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN business_settings.late_payment_interest_rate IS 'Interest rate charged on overdue invoices (percentage)';
COMMENT ON COLUMN business_settings.late_payment_fee_amount IS 'Fixed late payment fee amount';
COMMENT ON COLUMN business_settings.payment_reference_prefix IS 'Prefix for auto-generated payment references';
COMMENT ON COLUMN business_settings.late_payment_terms IS 'Late payment policy text displayed on invoices';
COMMENT ON COLUMN quotes.supply_date IS 'Tax point/supply date for VAT compliance';
COMMENT ON COLUMN quotes.po_number IS 'Customer purchase order number';
COMMENT ON COLUMN quotes.payment_reference IS 'Bank payment reference for reconciliation';
COMMENT ON COLUMN quotes.payment_status IS 'Invoice payment status: unpaid, partial, paid, overdue';
COMMENT ON COLUMN quotes.amount_paid IS 'Amount already paid against this invoice';
COMMENT ON COLUMN quotes.currency IS 'Currency code (e.g., GBP, USD, AUD)';
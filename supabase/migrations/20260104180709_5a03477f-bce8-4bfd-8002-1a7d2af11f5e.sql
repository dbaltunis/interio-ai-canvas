-- Add ERP/Invoice compliance fields to business_settings
ALTER TABLE business_settings ADD COLUMN IF NOT EXISTS legal_name TEXT;
ALTER TABLE business_settings ADD COLUMN IF NOT EXISTS trading_name TEXT;
ALTER TABLE business_settings ADD COLUMN IF NOT EXISTS registration_number TEXT;
ALTER TABLE business_settings ADD COLUMN IF NOT EXISTS tax_number TEXT;
ALTER TABLE business_settings ADD COLUMN IF NOT EXISTS organization_type TEXT;
ALTER TABLE business_settings ADD COLUMN IF NOT EXISTS default_payment_terms_days INTEGER DEFAULT 14;
ALTER TABLE business_settings ADD COLUMN IF NOT EXISTS financial_year_end_month INTEGER DEFAULT 6;
ALTER TABLE business_settings ADD COLUMN IF NOT EXISTS financial_year_end_day INTEGER DEFAULT 30;

-- Add comments for clarity
COMMENT ON COLUMN business_settings.legal_name IS 'Official registered legal entity name';
COMMENT ON COLUMN business_settings.trading_name IS 'Trading/DBA name if different from legal name';
COMMENT ON COLUMN business_settings.registration_number IS 'Company registration number (ACN, Company House #, NZBN, State Reg #)';
COMMENT ON COLUMN business_settings.tax_number IS 'Tax identification number (GST Reg #, VAT Number, EIN)';
COMMENT ON COLUMN business_settings.organization_type IS 'Business entity type (sole_trader, partnership, company, trust, other)';
COMMENT ON COLUMN business_settings.default_payment_terms_days IS 'Default payment terms in days for invoices';
COMMENT ON COLUMN business_settings.financial_year_end_month IS 'Month when financial year ends (1-12)';
COMMENT ON COLUMN business_settings.financial_year_end_day IS 'Day of month when financial year ends';
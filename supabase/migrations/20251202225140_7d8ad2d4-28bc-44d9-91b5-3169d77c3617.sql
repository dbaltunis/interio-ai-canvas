-- Add new JSONB columns to onboarding_progress for wizard data storage
ALTER TABLE onboarding_progress 
ADD COLUMN IF NOT EXISTS company_info JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS regional_settings JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS document_sequences JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS inventory_data JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS pricing_grids JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS window_coverings JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS manufacturing_settings JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS stock_management JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS email_templates JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS quotation_settings JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS integrations_config JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS users_permissions JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS uploaded_files JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS wizard_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS wizard_completed_at TIMESTAMPTZ;

-- Add comment for documentation
COMMENT ON TABLE onboarding_progress IS 'Stores client onboarding wizard progress and collected data for app setup';
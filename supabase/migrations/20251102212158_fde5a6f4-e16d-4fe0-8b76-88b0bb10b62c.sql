-- Add settings column to quote_templates table
ALTER TABLE quote_templates ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::jsonb;

-- Add index for better query performance on settings
CREATE INDEX IF NOT EXISTS idx_quote_templates_settings ON quote_templates USING gin(settings);
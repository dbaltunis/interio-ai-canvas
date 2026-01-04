-- Add display_order and is_primary columns to quote_templates
ALTER TABLE quote_templates 
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

ALTER TABLE quote_templates 
ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT FALSE;

-- Create index for ordering
CREATE INDEX IF NOT EXISTS idx_quote_templates_display_order ON quote_templates(display_order);
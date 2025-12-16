-- Add order_index column to template_option_settings for per-template option ordering
ALTER TABLE template_option_settings 
ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT NULL;

-- Create index for faster ordering queries
CREATE INDEX IF NOT EXISTS idx_template_option_settings_order 
ON template_option_settings(template_id, order_index);
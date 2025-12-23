-- Add heading_prices column to curtain_templates for heading-specific price overrides
ALTER TABLE curtain_templates 
ADD COLUMN IF NOT EXISTS heading_prices JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN curtain_templates.heading_prices IS 
'Heading-specific price overrides. Format: {"heading_id": {"machine_price": X, "hand_price": Y}}';
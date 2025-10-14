-- Add complexity_pricing_tiers column to curtain_templates
ALTER TABLE curtain_templates 
ADD COLUMN IF NOT EXISTS complexity_pricing_tiers JSONB DEFAULT '[]'::jsonb;
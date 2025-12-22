-- Add making/stitching charge fields to curtain_templates
ALTER TABLE curtain_templates 
ADD COLUMN IF NOT EXISTS making_charge_per_meter NUMERIC DEFAULT NULL,
ADD COLUMN IF NOT EXISTS making_charge_method TEXT DEFAULT 'per_meter',
ADD COLUMN IF NOT EXISTS heading_making_charges JSONB DEFAULT NULL;

COMMENT ON COLUMN curtain_templates.making_charge_per_meter IS 'Base making/stitching charge per meter';
COMMENT ON COLUMN curtain_templates.making_charge_method IS 'per_meter, per_panel, per_unit';
COMMENT ON COLUMN curtain_templates.heading_making_charges IS 'JSON object with heading_id: price overrides';
-- Add missing columns to making_costs table
ALTER TABLE making_costs 
ADD COLUMN IF NOT EXISTS markup_percentage NUMERIC DEFAULT 50,
ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES curtain_templates(id);

-- Update the table comment to reflect new structure
COMMENT ON TABLE making_costs IS 'Making cost configurations that combine templates with pricing';
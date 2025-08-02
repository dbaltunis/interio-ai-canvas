-- Add height-based drop pricing columns to curtain_templates table
ALTER TABLE public.curtain_templates 
ADD COLUMN IF NOT EXISTS drop_height_ranges JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS machine_drop_height_prices JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS hand_drop_height_prices JSONB DEFAULT '[]'::jsonb;

-- Add comments for new fields
COMMENT ON COLUMN public.curtain_templates.drop_height_ranges IS 'Height ranges for drop pricing (e.g., [{"min": 0, "max": 150}, {"min": 150, "max": 300}])';
COMMENT ON COLUMN public.curtain_templates.machine_drop_height_prices IS 'Machine-finished prices for each height range (e.g., [45.00, 55.00])';
COMMENT ON COLUMN public.curtain_templates.hand_drop_height_prices IS 'Hand-finished prices for each height range (e.g., [65.00, 75.00])';
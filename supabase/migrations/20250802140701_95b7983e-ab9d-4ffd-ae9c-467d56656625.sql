-- Add missing per-metre pricing fields to curtain_templates table
ALTER TABLE public.curtain_templates 
ADD COLUMN IF NOT EXISTS machine_price_per_metre NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS hand_price_per_metre NUMERIC DEFAULT 0;

-- Add comments for new fields
COMMENT ON COLUMN public.curtain_templates.machine_price_per_metre IS 'Standard machine-finished price per metre when not using height-based pricing';
COMMENT ON COLUMN public.curtain_templates.hand_price_per_metre IS 'Hand-finished price per metre when not using height-based pricing';
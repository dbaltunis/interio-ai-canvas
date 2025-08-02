-- Add missing pricing fields to curtain_templates table
ALTER TABLE public.curtain_templates 
ADD COLUMN IF NOT EXISTS offers_hand_finished BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS machine_price_per_drop NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS hand_price_per_drop NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS machine_price_per_panel NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS hand_price_per_panel NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS average_drop_width NUMERIC DEFAULT 140;

-- Add new height range pricing fields
ALTER TABLE public.curtain_templates 
ADD COLUMN IF NOT EXISTS uses_height_pricing BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS height_price_ranges JSONB DEFAULT '[{"min_height": 1, "max_height": 200, "price": 24}]';

-- Add legacy height pricing fields for backward compatibility
ALTER TABLE public.curtain_templates 
ADD COLUMN IF NOT EXISTS height_breakpoint NUMERIC DEFAULT 200,
ADD COLUMN IF NOT EXISTS price_above_breakpoint_multiplier NUMERIC DEFAULT 1.2;

-- Update pricing_type constraint to include new options
ALTER TABLE public.curtain_templates 
DROP CONSTRAINT IF EXISTS curtain_templates_pricing_type_check;

ALTER TABLE public.curtain_templates 
ADD CONSTRAINT curtain_templates_pricing_type_check 
CHECK (pricing_type IN ('per_metre', 'per_drop', 'per_panel', 'pricing_grid'));

-- Add comments for new fields
COMMENT ON COLUMN public.curtain_templates.height_price_ranges IS 'JSONB array of height-based pricing ranges with min_height, max_height, and price fields';
COMMENT ON COLUMN public.curtain_templates.uses_height_pricing IS 'Enable height-based pricing with multiple ranges instead of simple breakpoint';
COMMENT ON COLUMN public.curtain_templates.offers_hand_finished IS 'Whether this template offers hand-finished options in addition to machine-finished';
COMMENT ON COLUMN public.curtain_templates.average_drop_width IS 'Average drop width in centimeters for per-drop/per-panel pricing calculations';
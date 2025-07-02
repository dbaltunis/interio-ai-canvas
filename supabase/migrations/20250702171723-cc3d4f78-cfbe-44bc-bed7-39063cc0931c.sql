-- Migration to fix window covering system structural issues
-- This addresses fullness ratio placement, pricing method integration, and option selection improvements

-- 1. Add fullness_ratio to individual option levels where it actually belongs
-- (Moving from category level to option level for proper per-option fullness)

-- Add fullness_ratio to subcategories
ALTER TABLE public.window_covering_option_subcategories 
ADD COLUMN IF NOT EXISTS fullness_ratio DECIMAL(3,1) DEFAULT 1.0;

-- Add fullness_ratio to sub_subcategories  
ALTER TABLE public.window_covering_option_sub_subcategories 
ADD COLUMN IF NOT EXISTS fullness_ratio DECIMAL(3,1) DEFAULT 1.0;

-- Add fullness_ratio to extras
ALTER TABLE public.window_covering_option_extras 
ADD COLUMN IF NOT EXISTS fullness_ratio DECIMAL(3,1) DEFAULT 1.0;

-- 2. Add calculation method override at option level to support different pricing methods per option
ALTER TABLE public.window_covering_option_subcategories 
ADD COLUMN IF NOT EXISTS calculation_method TEXT DEFAULT 'inherit';

ALTER TABLE public.window_covering_option_sub_subcategories 
ADD COLUMN IF NOT EXISTS calculation_method TEXT DEFAULT 'inherit';

ALTER TABLE public.window_covering_option_extras 
ADD COLUMN IF NOT EXISTS calculation_method TEXT DEFAULT 'inherit';

-- 3. Improve window covering options table for better traditional option support
ALTER TABLE public.window_covering_options 
ADD COLUMN IF NOT EXISTS fullness_ratio DECIMAL(3,1) DEFAULT 1.0,
ADD COLUMN IF NOT EXISTS calculation_method TEXT DEFAULT 'per-unit';

-- 4. Add metadata to track which options affect fabric calculations
ALTER TABLE public.window_covering_option_categories 
ADD COLUMN IF NOT EXISTS affects_fabric_calculation BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS affects_labor_calculation BOOLEAN DEFAULT false;

-- 5. Create a table to store window covering calculation configurations
CREATE TABLE IF NOT EXISTS public.window_covering_calculation_configs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    window_covering_id UUID NOT NULL REFERENCES public.window_coverings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    
    -- Fabric calculation settings
    default_fabric_waste_percentage DECIMAL(5,2) DEFAULT 10.0,
    seam_allowance_cm DECIMAL(5,2) DEFAULT 1.5,
    pattern_repeat_allowance_cm DECIMAL(5,2) DEFAULT 0.0,
    
    -- Labor calculation settings
    base_labor_hours DECIMAL(5,2) DEFAULT 2.0,
    complexity_multiplier DECIMAL(3,2) DEFAULT 1.0,
    seam_labor_hours_per_seam DECIMAL(3,2) DEFAULT 0.5,
    
    -- Pricing overrides
    use_window_covering_pricing_method BOOLEAN DEFAULT true,
    override_pricing_method TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 6. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_calculation_configs_window_covering 
ON public.window_covering_calculation_configs(window_covering_id);

CREATE INDEX IF NOT EXISTS idx_calculation_configs_user 
ON public.window_covering_calculation_configs(user_id);

-- 7. Create RLS policies for calculation configs
ALTER TABLE public.window_covering_calculation_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own calculation configs" ON public.window_covering_calculation_configs
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 8. Create function to automatically create default calculation config when window covering is created
CREATE OR REPLACE FUNCTION public.create_default_calculation_config()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.window_covering_calculation_configs (
        window_covering_id,
        user_id
    ) VALUES (
        NEW.id,
        NEW.user_id
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Create trigger to auto-create calculation config
DROP TRIGGER IF EXISTS trigger_create_calculation_config ON public.window_coverings;
CREATE TRIGGER trigger_create_calculation_config
    AFTER INSERT ON public.window_coverings
    FOR EACH ROW
    EXECUTE FUNCTION public.create_default_calculation_config();

-- 10. Update existing window coverings to have calculation configs
INSERT INTO public.window_covering_calculation_configs (window_covering_id, user_id)
SELECT id, user_id 
FROM public.window_coverings 
WHERE id NOT IN (
    SELECT window_covering_id 
    FROM public.window_covering_calculation_configs
);

-- 11. Add comments to document the structure
COMMENT ON COLUMN public.window_covering_option_subcategories.fullness_ratio IS 'Fabric fullness multiplier for this specific option (e.g., 2.5 for pleated headings)';
COMMENT ON COLUMN public.window_covering_option_sub_subcategories.fullness_ratio IS 'Fabric fullness multiplier for this specific option';
COMMENT ON COLUMN public.window_covering_option_extras.fullness_ratio IS 'Fabric fullness multiplier for this specific option';

COMMENT ON COLUMN public.window_covering_option_subcategories.calculation_method IS 'How to calculate pricing: inherit, per-unit, per-linear-meter, per-linear-yard, per-sqm, fixed, percentage';
COMMENT ON COLUMN public.window_covering_option_sub_subcategories.calculation_method IS 'How to calculate pricing: inherit, per-unit, per-linear-meter, per-linear-yard, per-sqm, fixed, percentage';
COMMENT ON COLUMN public.window_covering_option_extras.calculation_method IS 'How to calculate pricing: inherit, per-unit, per-linear-meter, per-linear-yard, per-sqm, fixed, percentage';

COMMENT ON TABLE public.window_covering_calculation_configs IS 'Configuration settings for window covering price calculations, fabric usage, and labor estimates';
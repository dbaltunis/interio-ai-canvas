-- Phase 1: Enhanced backend infrastructure for making costs integration

-- Add source_type to distinguish option origins
ALTER TABLE public.window_covering_options 
ADD COLUMN source_type TEXT DEFAULT 'window_covering' CHECK (source_type IN ('window_covering', 'making_cost', 'both'));

-- Add making cost reference to track bundled options
ALTER TABLE public.window_covering_options
ADD COLUMN making_cost_id UUID REFERENCES public.making_costs(id);

-- Add indexes for performance
CREATE INDEX idx_window_covering_options_source_type ON public.window_covering_options(source_type);
CREATE INDEX idx_window_covering_options_making_cost_id ON public.window_covering_options(making_cost_id);

-- Enhance window covering option categories for better making cost integration
ALTER TABLE public.window_covering_option_categories 
ADD COLUMN source_preference TEXT DEFAULT 'either' CHECK (source_preference IN ('making_cost_only', 'window_covering_only', 'either'));

-- Add fabric calculation enhancement fields
ALTER TABLE public.window_covering_option_categories 
ADD COLUMN fabric_waste_factor NUMERIC DEFAULT 0.0,
ADD COLUMN pattern_repeat_factor NUMERIC DEFAULT 1.0,
ADD COLUMN seam_complexity_factor NUMERIC DEFAULT 1.0;

-- Add indexes
CREATE INDEX idx_window_covering_option_categories_source_preference ON public.window_covering_option_categories(source_preference);

-- Create table for making cost option mappings (for bundled options)
CREATE TABLE public.making_cost_option_mappings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    making_cost_id UUID NOT NULL REFERENCES public.making_costs(id) ON DELETE CASCADE,
    option_category_id UUID NOT NULL REFERENCES public.window_covering_option_categories(id) ON DELETE CASCADE,
    option_type TEXT NOT NULL CHECK (option_type IN ('heading', 'hardware', 'lining')),
    is_included BOOLEAN DEFAULT true,
    override_pricing NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    user_id UUID NOT NULL,
    UNIQUE(making_cost_id, option_category_id, option_type)
);

-- Enable RLS
ALTER TABLE public.making_cost_option_mappings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their own making cost option mappings"
ON public.making_cost_option_mappings
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_making_cost_option_mappings_updated_at
    BEFORE UPDATE ON public.making_cost_option_mappings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create fabric calculation cache table for performance
CREATE TABLE public.fabric_calculations_cache (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    window_covering_id UUID NOT NULL REFERENCES public.window_coverings(id) ON DELETE CASCADE,
    making_cost_id UUID REFERENCES public.making_costs(id) ON DELETE CASCADE,
    calculation_hash TEXT NOT NULL, -- MD5 hash of calculation parameters
    fabric_usage_data JSONB NOT NULL,
    cost_breakdown JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    user_id UUID NOT NULL,
    UNIQUE(calculation_hash)
);

-- Enable RLS and create policies
ALTER TABLE public.fabric_calculations_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own fabric calculations cache"
ON public.fabric_calculations_cache
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add index for fast lookups
CREATE INDEX idx_fabric_calculations_cache_hash ON public.fabric_calculations_cache(calculation_hash);
CREATE INDEX idx_fabric_calculations_cache_window_covering ON public.fabric_calculations_cache(window_covering_id);
CREATE INDEX idx_fabric_calculations_cache_making_cost ON public.fabric_calculations_cache(making_cost_id);
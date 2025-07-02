-- Create making_costs table for complete window covering configurations
CREATE TABLE public.making_costs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    pricing_method TEXT NOT NULL DEFAULT 'per-linear-meter',
    include_fabric_selection BOOLEAN DEFAULT true,
    measurement_type TEXT NOT NULL DEFAULT 'fabric-drop-required',
    
    -- JSON fields for flexible option storage
    heading_options JSONB DEFAULT '[]'::jsonb,
    hardware_options JSONB DEFAULT '[]'::jsonb,
    lining_options JSONB DEFAULT '[]'::jsonb,
    
    -- Drop ranges for tiered pricing
    drop_ranges JSONB DEFAULT '[]'::jsonb,
    
    -- Metadata
    description TEXT,
    active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.making_costs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own making costs" ON public.making_costs
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_making_costs_user_id ON public.making_costs(user_id);
CREATE INDEX idx_making_costs_active ON public.making_costs(active) WHERE active = true;

-- Add trigger for updated_at
CREATE TRIGGER update_making_costs_updated_at
    BEFORE UPDATE ON public.making_costs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Add comments
COMMENT ON TABLE public.making_costs IS 'Complete window covering configurations with bundled options, pricing methods, and automatic calculations';
COMMENT ON COLUMN public.making_costs.heading_options IS 'Array of heading options with name, pricing_method, base_price, fullness, sort_order';
COMMENT ON COLUMN public.making_costs.hardware_options IS 'Array of hardware options with name, pricing_method, base_price, sort_order';
COMMENT ON COLUMN public.making_costs.lining_options IS 'Array of lining options with name, pricing_method, base_price, sort_order';
COMMENT ON COLUMN public.making_costs.drop_ranges IS 'Array of drop ranges with min, max, price for tiered pricing';
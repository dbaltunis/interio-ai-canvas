
-- First, let's create a proper fabrics table to manage fabric details
CREATE TABLE public.fabrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  fabric_width NUMERIC NOT NULL DEFAULT 137, -- in cm
  pattern_repeat NUMERIC DEFAULT 0, -- in cm
  rotation_allowed BOOLEAN DEFAULT true,
  fabric_type TEXT, -- cotton, linen, silk, etc.
  weight TEXT, -- light, medium, heavy
  care_instructions TEXT,
  supplier TEXT,
  fabric_code TEXT,
  cost_per_meter NUMERIC DEFAULT 0,
  active BOOLEAN DEFAULT true,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for fabrics
ALTER TABLE public.fabrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own fabrics" ON public.fabrics
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create a unified components table to replace scattered component tables
CREATE TABLE public.components (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  component_type TEXT NOT NULL, -- 'hardware', 'fabric_accessory', 'heading', 'service', 'part'
  category TEXT, -- track, bracket, motor, lining, trimming, etc.
  price NUMERIC NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'per-unit', -- per-unit, per-meter, per-yard, per-piece
  fullness_ratio NUMERIC, -- for heading components
  specifications JSONB DEFAULT '{}',
  active BOOLEAN DEFAULT true,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for components
ALTER TABLE public.components ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own components" ON public.components
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Improve the calculation_formulas table structure
ALTER TABLE public.calculation_formulas 
ADD COLUMN IF NOT EXISTS formula_type TEXT DEFAULT 'fabric_calculation',
ADD COLUMN IF NOT EXISTS applies_to TEXT[], -- array of window covering types this applies to
ADD COLUMN IF NOT EXISTS conditions JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS output_unit TEXT DEFAULT 'meters';

-- Create a pricing_methods table for different pricing approaches
CREATE TABLE public.pricing_methods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  method_type TEXT NOT NULL, -- 'linear_meter', 'per_drop', 'per_panel', 'pricing_grid', 'fixed_price'
  base_price NUMERIC DEFAULT 0,
  pricing_grid_id UUID, -- reference to pricing_grids table
  calculation_formula_id UUID, -- reference to calculation_formulas table
  height_tiers JSONB DEFAULT '[]', -- height-based pricing tiers
  width_tiers JSONB DEFAULT '[]', -- width-based pricing tiers
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for pricing_methods
ALTER TABLE public.pricing_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own pricing methods" ON public.pricing_methods
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Update window_coverings table to be the main product catalog
ALTER TABLE public.window_coverings 
ADD COLUMN IF NOT EXISTS fabric_id UUID,
ADD COLUMN IF NOT EXISTS default_components UUID[], -- array of default component IDs
ADD COLUMN IF NOT EXISTS calculation_method_id UUID, -- reference to pricing_methods
ADD COLUMN IF NOT EXISTS minimum_width NUMERIC DEFAULT 30,
ADD COLUMN IF NOT EXISTS maximum_width NUMERIC DEFAULT 600,
ADD COLUMN IF NOT EXISTS minimum_height NUMERIC DEFAULT 30,
ADD COLUMN IF NOT EXISTS maximum_height NUMERIC DEFAULT 400;

-- Create window_covering_components junction table for available components
CREATE TABLE public.window_covering_components (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  window_covering_id UUID NOT NULL,
  component_id UUID NOT NULL,
  is_required BOOLEAN DEFAULT false,
  is_default BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for window_covering_components
ALTER TABLE public.window_covering_components ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own window covering components" ON public.window_covering_components
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_fabrics_user_id ON public.fabrics(user_id);
CREATE INDEX idx_components_user_id ON public.components(user_id);
CREATE INDEX idx_components_type ON public.components(component_type);
CREATE INDEX idx_pricing_methods_user_id ON public.pricing_methods(user_id);
CREATE INDEX idx_window_covering_components_window_covering_id ON public.window_covering_components(window_covering_id);
CREATE INDEX idx_window_covering_components_component_id ON public.window_covering_components(component_id);

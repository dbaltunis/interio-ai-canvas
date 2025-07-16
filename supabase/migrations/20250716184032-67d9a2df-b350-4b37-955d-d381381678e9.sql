
-- Create product_types table for curtains, blinds, etc.
CREATE TABLE public.product_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- 'curtain', 'blind', 'roman', etc.
  description TEXT,
  default_calculation_method TEXT DEFAULT 'per_width', -- 'per_width', 'per_meter', 'fixed_rate', 'tiered'
  default_fullness_ratio NUMERIC DEFAULT 2.0,
  requires_track_measurement BOOLEAN DEFAULT true,
  requires_drop_measurement BOOLEAN DEFAULT true,
  requires_pattern_repeat BOOLEAN DEFAULT true,
  default_waste_percentage NUMERIC DEFAULT 10.0,
  default_hem_allowance NUMERIC DEFAULT 15.0,
  default_seam_allowance NUMERIC DEFAULT 1.5,
  image_url TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create product_type_formulas junction table
CREATE TABLE public.product_type_formulas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_type_id UUID NOT NULL,
  formula_id UUID NOT NULL,
  formula_purpose TEXT NOT NULL, -- 'fabric_calculation', 'labor_calculation', 'hardware_calculation'
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create product_type_components junction table
CREATE TABLE public.product_type_components (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_type_id UUID NOT NULL,
  component_id UUID NOT NULL,
  component_purpose TEXT NOT NULL, -- 'fabric', 'heading', 'hardware', 'trimming', 'lining'
  is_required BOOLEAN DEFAULT false,
  is_default BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create enhanced making_costs table for labor calculations
CREATE TABLE public.making_costs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  product_type_id UUID,
  base_cost NUMERIC DEFAULT 0,
  cost_per_width NUMERIC DEFAULT 0,
  cost_per_meter NUMERIC DEFAULT 0,
  cost_per_hour NUMERIC DEFAULT 0,
  minimum_charge NUMERIC DEFAULT 0,
  complexity_multiplier NUMERIC DEFAULT 1.0,
  includes_lining BOOLEAN DEFAULT false,
  includes_heading BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.product_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own product types" ON public.product_types
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.product_type_formulas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own product type formulas" ON public.product_type_formulas
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.product_type_components ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own product type components" ON public.product_type_components
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.making_costs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own making costs" ON public.making_costs
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_product_types_user_id ON public.product_types(user_id);
CREATE INDEX idx_product_types_category ON public.product_types(category);
CREATE INDEX idx_product_type_formulas_product_type ON public.product_type_formulas(product_type_id);
CREATE INDEX idx_product_type_components_product_type ON public.product_type_components(product_type_id);
CREATE INDEX idx_making_costs_product_type ON public.making_costs(product_type_id);

-- Add updated_at triggers
CREATE TRIGGER update_product_types_updated_at BEFORE UPDATE ON public.product_types
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_making_costs_updated_at BEFORE UPDATE ON public.making_costs
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create curtain_templates table with enhanced pricing options
CREATE TABLE IF NOT EXISTS public.curtain_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  
  -- Curtain Type
  curtain_type TEXT NOT NULL DEFAULT 'single' CHECK (curtain_type IN ('single', 'pair')),
  
  -- Heading Style
  heading_name TEXT NOT NULL,
  selected_heading_ids TEXT[] DEFAULT '{}',
  fullness_ratio NUMERIC DEFAULT 1.0,
  extra_fabric_fixed NUMERIC DEFAULT 0,
  extra_fabric_percentage NUMERIC DEFAULT 0,
  heading_upcharge_per_metre NUMERIC DEFAULT 0,
  heading_upcharge_per_curtain NUMERIC DEFAULT 0,
  glider_spacing NUMERIC DEFAULT 0,
  eyelet_spacing NUMERIC DEFAULT 0,
  
  -- Fabric Requirements
  fabric_width_type TEXT NOT NULL DEFAULT 'wide' CHECK (fabric_width_type IN ('wide', 'narrow')),
  vertical_repeat NUMERIC DEFAULT 0,
  horizontal_repeat NUMERIC DEFAULT 0,
  fabric_direction TEXT NOT NULL DEFAULT 'standard' CHECK (fabric_direction IN ('standard', 'railroaded')),
  bottom_hem NUMERIC NOT NULL DEFAULT 15,
  side_hems NUMERIC NOT NULL DEFAULT 5,
  seam_hems NUMERIC NOT NULL DEFAULT 1.5,
  
  -- Manufacturing Configuration
  return_left NUMERIC NOT NULL DEFAULT 15,
  return_right NUMERIC NOT NULL DEFAULT 15,
  overlap NUMERIC NOT NULL DEFAULT 10,
  header_allowance NUMERIC NOT NULL DEFAULT 25,
  waste_percent NUMERIC NOT NULL DEFAULT 10,
  is_railroadable BOOLEAN DEFAULT false,
  
  -- Lining Options
  lining_types JSONB DEFAULT '[]',
  
  -- Hardware
  compatible_hardware TEXT[] DEFAULT '{}',
  
  -- Make-Up Pricing
  pricing_type TEXT NOT NULL DEFAULT 'per_metre' CHECK (pricing_type IN ('per_metre', 'per_drop', 'per_panel', 'pricing_grid')),
  offers_hand_finished BOOLEAN DEFAULT false,
  machine_price_per_drop NUMERIC DEFAULT 0,
  hand_price_per_drop NUMERIC DEFAULT 0,
  machine_price_per_panel NUMERIC DEFAULT 0,
  hand_price_per_panel NUMERIC DEFAULT 0,
  average_drop_width NUMERIC DEFAULT 140,
  
  -- Height Range Pricing (NEW)
  uses_height_pricing BOOLEAN DEFAULT false,
  height_price_ranges JSONB DEFAULT '[{"min_height": 1, "max_height": 200, "price": 24}]',
  
  -- Legacy height pricing (for backward compatibility)
  height_breakpoint NUMERIC DEFAULT 200,
  price_above_breakpoint_multiplier NUMERIC DEFAULT 1.2,
  
  -- Price Rules
  price_rules JSONB DEFAULT '[]',
  unit_price NUMERIC DEFAULT 0,
  pricing_grid_data JSONB DEFAULT '{}',
  
  -- Manufacturing
  manufacturing_type TEXT NOT NULL DEFAULT 'machine' CHECK (manufacturing_type IN ('machine', 'hand')),
  hand_finished_upcharge_fixed NUMERIC DEFAULT 0,
  hand_finished_upcharge_percentage NUMERIC DEFAULT 0,
  
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.curtain_templates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for curtain_templates
CREATE POLICY "Users can view their own curtain templates" 
ON public.curtain_templates 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own curtain templates" 
ON public.curtain_templates 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own curtain templates" 
ON public.curtain_templates 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own curtain templates" 
ON public.curtain_templates 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_curtain_templates_updated_at
BEFORE UPDATE ON public.curtain_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_curtain_templates_user_id ON public.curtain_templates(user_id);
CREATE INDEX idx_curtain_templates_active ON public.curtain_templates(active);
CREATE INDEX idx_curtain_templates_pricing_type ON public.curtain_templates(pricing_type);

-- Add comments for documentation
COMMENT ON TABLE public.curtain_templates IS 'Template configurations for curtain products with detailed pricing and manufacturing specifications';
COMMENT ON COLUMN public.curtain_templates.height_price_ranges IS 'JSONB array of height-based pricing ranges with min_height, max_height, and price fields';
COMMENT ON COLUMN public.curtain_templates.pricing_type IS 'Pricing method: per_metre, per_drop (British), per_panel (American), or pricing_grid';
COMMENT ON COLUMN public.curtain_templates.uses_height_pricing IS 'Enable height-based pricing with multiple ranges instead of simple breakpoint';
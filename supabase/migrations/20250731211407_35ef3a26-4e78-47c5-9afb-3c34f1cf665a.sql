-- Create enhanced inventory items table with support for all item types
CREATE TABLE public.enhanced_inventory_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  sku TEXT,
  category TEXT NOT NULL, -- 'fabric', 'hardware', 'heading', 'service'
  
  -- Basic inventory fields
  quantity NUMERIC DEFAULT 0,
  unit TEXT DEFAULT 'pieces',
  cost_price NUMERIC DEFAULT 0,
  selling_price NUMERIC DEFAULT 0,
  unit_price NUMERIC DEFAULT 0,
  supplier TEXT,
  location TEXT,
  reorder_point NUMERIC DEFAULT 0,
  active BOOLEAN DEFAULT true,
  
  -- Fabric-specific fields
  fabric_width NUMERIC,
  fabric_composition TEXT,
  fabric_care_instructions TEXT,
  fabric_origin TEXT,
  pattern_repeat_horizontal NUMERIC DEFAULT 0,
  pattern_repeat_vertical NUMERIC DEFAULT 0,
  fabric_grade TEXT,
  fabric_collection TEXT,
  is_flame_retardant BOOLEAN DEFAULT false,
  
  -- Hardware-specific fields
  hardware_finish TEXT,
  hardware_material TEXT,
  hardware_dimensions TEXT,
  hardware_weight NUMERIC,
  hardware_mounting_type TEXT,
  hardware_load_capacity NUMERIC,
  
  -- Pricing fields
  price_per_yard NUMERIC,
  price_per_meter NUMERIC,
  price_per_unit NUMERIC,
  markup_percentage NUMERIC DEFAULT 0,
  
  -- Specification fields
  width NUMERIC,
  height NUMERIC,
  depth NUMERIC,
  weight NUMERIC,
  color TEXT,
  finish TEXT,
  
  -- Service/Heading specific fields
  labor_hours NUMERIC DEFAULT 0,
  fullness_ratio NUMERIC DEFAULT 1.0, -- For headings
  service_rate NUMERIC DEFAULT 0, -- Hourly rate for services
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.enhanced_inventory_items ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own enhanced inventory items" 
ON public.enhanced_inventory_items 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own enhanced inventory items" 
ON public.enhanced_inventory_items 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own enhanced inventory items" 
ON public.enhanced_inventory_items 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own enhanced inventory items" 
ON public.enhanced_inventory_items 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_enhanced_inventory_items_updated_at
BEFORE UPDATE ON public.enhanced_inventory_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_enhanced_inventory_items_user_id ON public.enhanced_inventory_items(user_id);
CREATE INDEX idx_enhanced_inventory_items_category ON public.enhanced_inventory_items(category);
CREATE INDEX idx_enhanced_inventory_items_active ON public.enhanced_inventory_items(active);
CREATE INDEX idx_enhanced_inventory_items_name ON public.enhanced_inventory_items(name);

-- Create temporary components table for migration
CREATE TABLE public.components_temp (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  component_type TEXT NOT NULL, -- 'heading', 'service', 'hardware', 'fabric_accessory'
  fullness_ratio NUMERIC DEFAULT 1.0,
  labor_hours NUMERIC DEFAULT 0,
  cost_price NUMERIC DEFAULT 0,
  selling_price NUMERIC DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for temp table
ALTER TABLE public.components_temp ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own components temp" 
ON public.components_temp 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own components temp" 
ON public.components_temp 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own components temp" 
ON public.components_temp 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own components temp" 
ON public.components_temp 
FOR DELETE 
USING (auth.uid() = user_id);
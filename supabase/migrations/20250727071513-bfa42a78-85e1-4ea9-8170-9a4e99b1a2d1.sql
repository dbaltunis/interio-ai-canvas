-- Enhanced inventory management schema for fabrics, blinds, and hardware

-- Create inventory categories table
CREATE TABLE public.inventory_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category_type TEXT NOT NULL CHECK (category_type IN ('fabric', 'hardware', 'wallcovering', 'service', 'accessory')),
  parent_category_id UUID REFERENCES public.inventory_categories(id),
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.inventory_categories ENABLE ROW LEVEL SECURITY;

-- Create policies for inventory_categories
CREATE POLICY "Users can view their own categories" ON public.inventory_categories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own categories" ON public.inventory_categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own categories" ON public.inventory_categories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own categories" ON public.inventory_categories FOR DELETE USING (auth.uid() = user_id);

-- Extend existing inventory table with specialized fields
ALTER TABLE public.inventory 
ADD COLUMN IF NOT EXISTS fabric_width NUMERIC,
ADD COLUMN IF NOT EXISTS pattern_repeat_vertical NUMERIC,
ADD COLUMN IF NOT EXISTS pattern_repeat_horizontal NUMERIC,
ADD COLUMN IF NOT EXISTS fullness_ratio NUMERIC DEFAULT 2.5,
ADD COLUMN IF NOT EXISTS composition TEXT,
ADD COLUMN IF NOT EXISTS care_instructions TEXT,
ADD COLUMN IF NOT EXISTS roll_direction TEXT CHECK (roll_direction IN ('face_in', 'face_out', 'either')),
ADD COLUMN IF NOT EXISTS collection_name TEXT,
ADD COLUMN IF NOT EXISTS color_code TEXT,
ADD COLUMN IF NOT EXISTS pattern_direction TEXT CHECK (pattern_direction IN ('straight', 'half_drop', 'random')),
ADD COLUMN IF NOT EXISTS transparency_level TEXT CHECK (transparency_level IN ('blackout', 'dim_out', 'screen', 'transparent')),
ADD COLUMN IF NOT EXISTS fire_rating TEXT,
ADD COLUMN IF NOT EXISTS hardware_type TEXT CHECK (hardware_type IN ('track', 'rod', 'bracket', 'motor', 'accessory')),
ADD COLUMN IF NOT EXISTS material_finish TEXT,
ADD COLUMN IF NOT EXISTS weight_capacity NUMERIC,
ADD COLUMN IF NOT EXISTS max_length NUMERIC,
ADD COLUMN IF NOT EXISTS installation_type TEXT,
ADD COLUMN IF NOT EXISTS compatibility_tags TEXT[],
ADD COLUMN IF NOT EXISTS pricing_method TEXT DEFAULT 'per_unit' CHECK (pricing_method IN ('per_unit', 'per_meter', 'per_sqm', 'per_roll', 'price_grid')),
ADD COLUMN IF NOT EXISTS pricing_grid JSONB,
ADD COLUMN IF NOT EXISTS specifications JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS images TEXT[],
ADD COLUMN IF NOT EXISTS vendor_id UUID,
ADD COLUMN IF NOT EXISTS reorder_point INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS reorder_quantity INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_ordered_date DATE,
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.inventory_categories(id);

-- Create hardware assemblies table for kit building
CREATE TABLE public.hardware_assemblies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  assembly_type TEXT NOT NULL CHECK (assembly_type IN ('track_system', 'rod_system', 'motor_kit', 'bracket_set')),
  components JSONB NOT NULL DEFAULT '[]',
  total_cost NUMERIC DEFAULT 0,
  selling_price NUMERIC DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for hardware_assemblies
ALTER TABLE public.hardware_assemblies ENABLE ROW LEVEL SECURITY;

-- Create policies for hardware_assemblies
CREATE POLICY "Users can view their own assemblies" ON public.hardware_assemblies FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own assemblies" ON public.hardware_assemblies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own assemblies" ON public.hardware_assemblies FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own assemblies" ON public.hardware_assemblies FOR DELETE USING (auth.uid() = user_id);

-- Create inventory movements table for tracking
CREATE TABLE public.inventory_movements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  inventory_id UUID NOT NULL REFERENCES public.inventory(id),
  movement_type TEXT NOT NULL CHECK (movement_type IN ('stock_in', 'stock_out', 'adjustment', 'transfer', 'reserved', 'unreserved')),
  quantity NUMERIC NOT NULL,
  reference_type TEXT CHECK (reference_type IN ('purchase_order', 'sale_order', 'adjustment', 'transfer', 'project')),
  reference_id UUID,
  notes TEXT,
  movement_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for inventory_movements
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;

-- Create policies for inventory_movements
CREATE POLICY "Users can view their own movements" ON public.inventory_movements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own movements" ON public.inventory_movements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_inventory_categories_updated_at
  BEFORE UPDATE ON public.inventory_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_hardware_assemblies_updated_at
  BEFORE UPDATE ON public.hardware_assemblies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_inventory_category_type ON public.inventory(category);
CREATE INDEX idx_inventory_fabric_width ON public.inventory(fabric_width);
CREATE INDEX idx_inventory_reorder_point ON public.inventory(reorder_point);
CREATE INDEX idx_inventory_movements_inventory_id ON public.inventory_movements(inventory_id);
CREATE INDEX idx_inventory_movements_date ON public.inventory_movements(movement_date);
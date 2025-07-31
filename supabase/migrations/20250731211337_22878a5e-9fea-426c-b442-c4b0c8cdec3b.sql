-- Create enhanced inventory items table to support all component types
CREATE TABLE IF NOT EXISTS enhanced_inventory_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  sku TEXT,
  category_type TEXT NOT NULL DEFAULT 'hardware', -- 'fabric', 'hardware', 'heading', 'service', 'parts'
  subcategory TEXT,
  quantity NUMERIC DEFAULT 0,
  unit TEXT DEFAULT 'pieces',
  cost_price NUMERIC DEFAULT 0,
  selling_price NUMERIC DEFAULT 0,
  markup_percentage NUMERIC DEFAULT 0,
  supplier TEXT,
  location TEXT,
  width NUMERIC,
  height NUMERIC,
  weight NUMERIC,
  color TEXT,
  pattern TEXT,
  material TEXT,
  finish TEXT,
  brand TEXT,
  model TEXT,
  reorder_point NUMERIC DEFAULT 10,
  lead_time_days INTEGER DEFAULT 7,
  minimum_order_quantity NUMERIC DEFAULT 1,
  
  -- Fabric-specific fields
  fabric_type TEXT,
  fabric_width NUMERIC,
  fabric_weight_gsm NUMERIC,
  care_instructions TEXT,
  composition TEXT,
  
  -- Hardware-specific fields
  hardware_type TEXT,
  mounting_type TEXT,
  load_capacity NUMERIC,
  dimensions_length NUMERIC,
  dimensions_width NUMERIC,
  dimensions_height NUMERIC,
  finish_type TEXT,
  
  -- Heading-specific fields (for fabric fullness calculations)
  fullness_ratio NUMERIC DEFAULT 1.0,
  heading_type TEXT,
  
  -- Service-specific fields
  service_type TEXT,
  hourly_rate NUMERIC,
  duration_minutes INTEGER,
  per_unit_charge BOOLEAN DEFAULT false,
  
  -- Pricing and specifications
  pricing_method TEXT DEFAULT 'fixed', -- 'fixed', 'per_unit', 'per_area', 'per_width'
  base_price NUMERIC DEFAULT 0,
  price_per_unit NUMERIC DEFAULT 0,
  price_per_sqm NUMERIC DEFAULT 0,
  price_per_meter NUMERIC DEFAULT 0,
  
  -- Inventory tracking
  track_inventory BOOLEAN DEFAULT true,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE enhanced_inventory_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own inventory items" 
ON enhanced_inventory_items 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own inventory items" 
ON enhanced_inventory_items 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own inventory items" 
ON enhanced_inventory_items 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own inventory items" 
ON enhanced_inventory_items 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER update_enhanced_inventory_items_updated_at
BEFORE UPDATE ON enhanced_inventory_items
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Insert default heading categories
INSERT INTO inventory_categories (user_id, name, description, category_type, active)
SELECT auth.uid(), 'Headings', 'Curtain and drape heading styles', 'heading', true
WHERE NOT EXISTS (
  SELECT 1 FROM inventory_categories 
  WHERE category_type = 'heading' AND user_id = auth.uid()
);

-- Insert default service categories  
INSERT INTO inventory_categories (user_id, name, description, category_type, active)
SELECT auth.uid(), 'Services', 'Installation and measurement services', 'service', true
WHERE NOT EXISTS (
  SELECT 1 FROM inventory_categories 
  WHERE category_type = 'service' AND user_id = auth.uid()
);

-- Create components table for existing heading/service data migration
CREATE TABLE IF NOT EXISTS components (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  component_type TEXT NOT NULL, -- 'heading', 'service', 'hardware', 'fabric', 'parts'
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC DEFAULT 0,
  unit TEXT DEFAULT 'pieces',
  specifications JSONB DEFAULT '{}',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for components
ALTER TABLE components ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for components
CREATE POLICY "Users can view their own components" 
ON components 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own components" 
ON components 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own components" 
ON components 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own components" 
ON components 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create updated_at trigger for components
CREATE TRIGGER update_components_updated_at
BEFORE UPDATE ON components
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
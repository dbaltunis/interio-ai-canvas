-- Create product_variants table for dynamic colors, materials, finishes
CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  variant_type TEXT NOT NULL,
  name TEXT NOT NULL,
  value TEXT NOT NULL,
  hex_color TEXT,
  image_url TEXT,
  is_default BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create eyelet_rings table
CREATE TABLE eyelet_rings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  diameter NUMERIC NOT NULL,
  material TEXT NOT NULL,
  finish TEXT NOT NULL,
  image_url TEXT,
  cost_price NUMERIC DEFAULT 0,
  selling_price NUMERIC DEFAULT 0,
  supplier TEXT,
  vendor_id UUID REFERENCES vendors(id),
  is_default BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create default_inventory_templates table
CREATE TABLE default_inventory_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT NOT NULL,
  description TEXT,
  specifications JSONB DEFAULT '{}',
  pricing JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  is_popular BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add show_in_quote column to enhanced_inventory_items
ALTER TABLE enhanced_inventory_items
ADD COLUMN IF NOT EXISTS show_in_quote BOOLEAN DEFAULT true;

-- Enable RLS
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE eyelet_rings ENABLE ROW LEVEL SECURITY;
ALTER TABLE default_inventory_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for product_variants
CREATE POLICY "Users can view their own variants and defaults"
ON product_variants FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR user_id IS NULL OR is_default = true);

CREATE POLICY "Users can create their own variants"
ON product_variants FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own variants"
ON product_variants FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own variants"
ON product_variants FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- RLS Policies for eyelet_rings
CREATE POLICY "Users can view their own rings and defaults"
ON eyelet_rings FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR user_id IS NULL OR is_default = true);

CREATE POLICY "Users can create their own rings"
ON eyelet_rings FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own rings"
ON eyelet_rings FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own rings"
ON eyelet_rings FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- RLS Policies for default_inventory_templates
CREATE POLICY "All users can view default templates"
ON default_inventory_templates FOR SELECT
TO authenticated
USING (true);

-- Seed default product variants
INSERT INTO product_variants (variant_type, name, value, hex_color, is_default, sort_order) VALUES
  ('color', 'Silver', 'silver', '#C0C0C0', true, 1),
  ('color', 'Gold', 'gold', '#FFD700', true, 2),
  ('color', 'Bronze', 'bronze', '#CD7F32', true, 3),
  ('color', 'Black', 'black', '#000000', true, 4),
  ('color', 'White', 'white', '#FFFFFF', true, 5),
  ('color', 'Brass', 'brass', '#B5A642', true, 6),
  ('material', 'Metal', 'metal', NULL, true, 1),
  ('material', 'Plastic', 'plastic', NULL, true, 2),
  ('material', 'Wood', 'wood', NULL, true, 3),
  ('material', 'Brass', 'brass', NULL, true, 4),
  ('finish', 'Brushed', 'brushed', NULL, true, 1),
  ('finish', 'Polished', 'polished', NULL, true, 2),
  ('finish', 'Matte', 'matte', NULL, true, 3),
  ('finish', 'Antique', 'antique', NULL, true, 4),
  ('finish', 'Gloss', 'gloss', NULL, true, 5),
  ('heading_type', 'Pencil Pleat Tape', 'pencil_pleat', NULL, true, 1),
  ('heading_type', 'Eyelet Pleat Tape', 'eyelet_pleat', NULL, true, 2),
  ('heading_type', 'Pinch Pleat Tape', 'pinch_pleat', NULL, true, 3),
  ('heading_type', 'Wave Tape', 'wave_tape', NULL, true, 4),
  ('heading_type', 'Tab Top', 'tab_top', NULL, true, 5),
  ('heading_type', 'Rod Pocket', 'rod_pocket', NULL, true, 6),
  ('heading_type', 'Grommet/Eyelet', 'grommet', NULL, true, 7);

-- Seed default eyelet rings
INSERT INTO eyelet_rings (name, color, diameter, material, finish, cost_price, selling_price, is_default) VALUES
  ('Silver 25mm', 'silver', 25, 'metal', 'brushed', 0.50, 1.50, true),
  ('Silver 40mm', 'silver', 40, 'metal', 'brushed', 0.75, 2.00, true),
  ('Gold 25mm', 'gold', 25, 'metal', 'polished', 0.60, 1.75, true),
  ('Gold 40mm', 'gold', 40, 'metal', 'polished', 0.85, 2.25, true),
  ('Bronze 30mm', 'bronze', 30, 'metal', 'antique', 0.65, 1.90, true),
  ('Black 25mm', 'black', 25, 'metal', 'matte', 0.45, 1.40, true),
  ('White 25mm', 'white', 25, 'plastic', 'gloss', 0.30, 1.00, true);

-- Seed popular heading templates
INSERT INTO default_inventory_templates (name, category, subcategory, description, specifications, pricing, metadata, is_popular, sort_order) VALUES
  ('Wave Tape - 2.5x Fullness', 'heading', 'wave_tape', 'Most popular modern heading style - creates beautiful S-curve waves', 
   '{"fullness_ratio": 2.5, "treatment_type": "Curtains, Drapes"}'::jsonb,
   '{"cost_price": 8.50, "selling_price": 15.00}'::jsonb,
   '{}'::jsonb, true, 1),
  ('Eyelet Heading - Silver Rings', 'heading', 'eyelet_pleat', 'Contemporary eyelet heading with silver 40mm rings',
   '{"fullness_ratio": 2.0, "treatment_type": "Curtains"}'::jsonb,
   '{"cost_price": 12.00, "selling_price": 20.00}'::jsonb,
   '{"default_ring": "silver-40mm"}'::jsonb, true, 2),
  ('Pencil Pleat - 2.5x Fullness', 'heading', 'pencil_pleat', 'Classic gathered heading style',
   '{"fullness_ratio": 2.5, "treatment_type": "Curtains, Valances"}'::jsonb,
   '{"cost_price": 6.50, "selling_price": 12.00}'::jsonb,
   '{}'::jsonb, true, 3),
  ('Pinch Pleat - 2.5x Fullness', 'heading', 'pinch_pleat', 'Traditional tailored heading with grouped pleats',
   '{"fullness_ratio": 2.5, "treatment_type": "Curtains, Drapes"}'::jsonb,
   '{"cost_price": 9.00, "selling_price": 16.00}'::jsonb,
   '{}'::jsonb, true, 4);
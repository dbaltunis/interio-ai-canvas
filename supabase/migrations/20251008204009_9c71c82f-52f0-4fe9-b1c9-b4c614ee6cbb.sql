-- Add is_default column to enhanced_inventory_items
ALTER TABLE enhanced_inventory_items 
ADD COLUMN IF NOT EXISTS is_default boolean DEFAULT false;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_enhanced_inventory_is_default 
ON enhanced_inventory_items(is_default, category, active);

-- Update RLS policy to include default items
DROP POLICY IF EXISTS "Users can view account inventory" ON enhanced_inventory_items;

CREATE POLICY "Users can view account inventory and defaults"
ON enhanced_inventory_items FOR SELECT
USING (
  (get_account_owner(auth.uid()) = user_id) OR is_default = true
);

-- Insert default treatment options for Roller Blinds
INSERT INTO enhanced_inventory_items (
  name, description, category, treatment_type, cost_price, selling_price, 
  is_default, active, user_id
) VALUES
-- Tube Sizes
('25mm Tube', '{"option_type": "tube_size", "option_value": "25"}', 'treatment_option', 'roller_blind', 0, 0, true, true, (SELECT id FROM auth.users LIMIT 1)),
('32mm Tube', '{"option_type": "tube_size", "option_value": "32"}', 'treatment_option', 'roller_blind', 5, 8, true, true, (SELECT id FROM auth.users LIMIT 1)),
('38mm Tube', '{"option_type": "tube_size", "option_value": "38"}', 'treatment_option', 'roller_blind', 8, 12, true, true, (SELECT id FROM auth.users LIMIT 1)),
('45mm Tube', '{"option_type": "tube_size", "option_value": "45"}', 'treatment_option', 'roller_blind', 12, 18, true, true, (SELECT id FROM auth.users LIMIT 1)),

-- Mount Types
('Inside Mount', '{"option_type": "mount_type", "option_value": "inside_mount"}', 'treatment_option', 'roller_blind', 0, 0, true, true, (SELECT id FROM auth.users LIMIT 1)),
('Outside Mount', '{"option_type": "mount_type", "option_value": "outside_mount"}', 'treatment_option', 'roller_blind', 0, 0, true, true, (SELECT id FROM auth.users LIMIT 1)),
('Ceiling Mount', '{"option_type": "mount_type", "option_value": "ceiling_mount"}', 'treatment_option', 'roller_blind', 5, 10, true, true, (SELECT id FROM auth.users LIMIT 1)),

-- Fascia Types
('No Fascia', '{"option_type": "fascia_type", "option_value": "none"}', 'treatment_option', 'roller_blind', 0, 0, true, true, (SELECT id FROM auth.users LIMIT 1)),
('Standard Fascia', '{"option_type": "fascia_type", "option_value": "standard"}', 'treatment_option', 'roller_blind', 15, 25, true, true, (SELECT id FROM auth.users LIMIT 1)),
('Decorative Fascia', '{"option_type": "fascia_type", "option_value": "decorative"}', 'treatment_option', 'roller_blind', 25, 40, true, true, (SELECT id FROM auth.users LIMIT 1)),
('Cassette System', '{"option_type": "fascia_type", "option_value": "cassette"}', 'treatment_option', 'roller_blind', 35, 55, true, true, (SELECT id FROM auth.users LIMIT 1)),

-- Bottom Rail Styles
('Aluminum Bottom Bar', '{"option_type": "bottom_rail_style", "option_value": "aluminum"}', 'treatment_option', 'roller_blind', 8, 12, true, true, (SELECT id FROM auth.users LIMIT 1)),
('Weighted Bottom Bar', '{"option_type": "bottom_rail_style", "option_value": "weighted"}', 'treatment_option', 'roller_blind', 12, 18, true, true, (SELECT id FROM auth.users LIMIT 1)),
('Slimline Bottom Bar', '{"option_type": "bottom_rail_style", "option_value": "slimline"}', 'treatment_option', 'roller_blind', 10, 15, true, true, (SELECT id FROM auth.users LIMIT 1)),

-- Control Types
('Chain Control', '{"option_type": "control_type", "option_value": "chain"}', 'treatment_option', 'roller_blind', 0, 0, true, true, (SELECT id FROM auth.users LIMIT 1)),
('Spring Control', '{"option_type": "control_type", "option_value": "spring"}', 'treatment_option', 'roller_blind', 5, 10, true, true, (SELECT id FROM auth.users LIMIT 1)),
('Motorized', '{"option_type": "control_type", "option_value": "motorized"}', 'treatment_option', 'roller_blind', 150, 250, true, true, (SELECT id FROM auth.users LIMIT 1)),

-- Motor Types
('Battery Motor', '{"option_type": "motor_type", "option_value": "battery"}', 'treatment_option', 'roller_blind', 120, 200, true, true, (SELECT id FROM auth.users LIMIT 1)),
('Wired Motor', '{"option_type": "motor_type", "option_value": "wired"}', 'treatment_option', 'roller_blind', 150, 250, true, true, (SELECT id FROM auth.users LIMIT 1)),
('Solar Motor', '{"option_type": "motor_type", "option_value": "solar"}', 'treatment_option', 'roller_blind', 180, 300, true, true, (SELECT id FROM auth.users LIMIT 1)),
('Smart Home Motor', '{"option_type": "motor_type", "option_value": "smart"}', 'treatment_option', 'roller_blind', 200, 350, true, true, (SELECT id FROM auth.users LIMIT 1)),

-- Roman Blind Options
-- Headrail Types
('Standard Headrail', '{"option_type": "headrail_type", "option_value": "standard"}', 'treatment_option', 'roman_blind', 0, 0, true, true, (SELECT id FROM auth.users LIMIT 1)),
('Deluxe Headrail', '{"option_type": "headrail_type", "option_value": "deluxe"}', 'treatment_option', 'roman_blind', 15, 25, true, true, (SELECT id FROM auth.users LIMIT 1)),

-- Fold Styles
('Flat Fold', '{"option_type": "fold_style", "option_value": "flat"}', 'treatment_option', 'roman_blind', 0, 0, true, true, (SELECT id FROM auth.users LIMIT 1)),
('Hobbled Fold', '{"option_type": "fold_style", "option_value": "hobbled"}', 'treatment_option', 'roman_blind', 10, 20, true, true, (SELECT id FROM auth.users LIMIT 1)),
('Waterfall Fold', '{"option_type": "fold_style", "option_value": "waterfall"}', 'treatment_option', 'roman_blind', 15, 25, true, true, (SELECT id FROM auth.users LIMIT 1)),

-- Roman Blind Lining
('No Lining', '{"option_type": "lining_type", "option_value": "none"}', 'treatment_option', 'roman_blind', 0, 0, true, true, (SELECT id FROM auth.users LIMIT 1)),
('Standard Lining', '{"option_type": "lining_type", "option_value": "standard"}', 'treatment_option', 'roman_blind', 15, 25, true, true, (SELECT id FROM auth.users LIMIT 1)),
('Blackout Lining', '{"option_type": "lining_type", "option_value": "blackout"}', 'treatment_option', 'roman_blind', 25, 40, true, true, (SELECT id FROM auth.users LIMIT 1)),

-- Venetian Blind Options
-- Slat Sizes
('25mm Slat', '{"option_type": "slat_size", "option_value": "25"}', 'treatment_option', 'venetian_blind', 0, 0, true, true, (SELECT id FROM auth.users LIMIT 1)),
('50mm Slat', '{"option_type": "slat_size", "option_value": "50"}', 'treatment_option', 'venetian_blind', 5, 10, true, true, (SELECT id FROM auth.users LIMIT 1)),
('63mm Slat', '{"option_type": "slat_size", "option_value": "63"}', 'treatment_option', 'venetian_blind', 8, 15, true, true, (SELECT id FROM auth.users LIMIT 1)),

-- Venetian Materials
('Aluminum', '{"option_type": "material", "option_value": "aluminum"}', 'treatment_option', 'venetian_blind', 0, 0, true, true, (SELECT id FROM auth.users LIMIT 1)),
('Timber', '{"option_type": "material", "option_value": "timber"}', 'treatment_option', 'venetian_blind', 20, 35, true, true, (SELECT id FROM auth.users LIMIT 1)),
('Faux Wood', '{"option_type": "material", "option_value": "faux_wood"}', 'treatment_option', 'venetian_blind', 12, 22, true, true, (SELECT id FROM auth.users LIMIT 1)),

-- Plantation Shutter Options
-- Louvre Sizes
('63mm Louvre', '{"option_type": "louvre_size", "option_value": "63"}', 'treatment_option', 'plantation_shutter', 0, 0, true, true, (SELECT id FROM auth.users LIMIT 1)),
('89mm Louvre', '{"option_type": "louvre_size", "option_value": "89"}', 'treatment_option', 'plantation_shutter', 15, 25, true, true, (SELECT id FROM auth.users LIMIT 1)),
('114mm Louvre', '{"option_type": "louvre_size", "option_value": "114"}', 'treatment_option', 'plantation_shutter', 20, 35, true, true, (SELECT id FROM auth.users LIMIT 1)),

-- Frame Types
('L-Frame', '{"option_type": "frame_type", "option_value": "l_frame"}', 'treatment_option', 'plantation_shutter', 0, 0, true, true, (SELECT id FROM auth.users LIMIT 1)),
('Z-Frame', '{"option_type": "frame_type", "option_value": "z_frame"}', 'treatment_option', 'plantation_shutter', 10, 20, true, true, (SELECT id FROM auth.users LIMIT 1)),
('Full Frame', '{"option_type": "frame_type", "option_value": "full_frame"}', 'treatment_option', 'plantation_shutter', 25, 40, true, true, (SELECT id FROM auth.users LIMIT 1)),

-- Shutter Materials
('Basswood', '{"option_type": "material", "option_value": "basswood"}', 'treatment_option', 'plantation_shutter', 0, 0, true, true, (SELECT id FROM auth.users LIMIT 1)),
('Paulownia', '{"option_type": "material", "option_value": "paulownia"}', 'treatment_option', 'plantation_shutter', 10, 18, true, true, (SELECT id FROM auth.users LIMIT 1)),
('PVC', '{"option_type": "material", "option_value": "pvc"}', 'treatment_option', 'plantation_shutter', -5, 0, true, true, (SELECT id FROM auth.users LIMIT 1)),
('Poly Resin', '{"option_type": "material", "option_value": "poly_resin"}', 'treatment_option', 'plantation_shutter', 15, 25, true, true, (SELECT id FROM auth.users LIMIT 1))

ON CONFLICT DO NOTHING;
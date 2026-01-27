-- Migration 1: Create Venetian Template + 58 Slat Materials

-- 1. Insert Venetian Blind Template
INSERT INTO curtain_templates (
  user_id, name, description, treatment_category,
  pricing_type, manufacturing_type, system_type, active,
  fullness_ratio, fabric_width_type, fabric_direction,
  bottom_hem, side_hems, seam_hems
)
VALUES (
  '32a92783-f482-4e3d-8ebf-c292200674e5',
  'Medinės žaliuzės',
  'Medinės žaliuzės su pasirenkamais lamelių pločiais ir spalvomis',
  'venetian_blinds',
  'pricing_grid',
  'venetian',
  'venetian_standard',
  true,
  1.0, 'standard', 'horizontal',
  0, 0, 0
);

-- 2. Insert 58 Slat Materials (enhanced_inventory_items)

-- 25mm Basswood (7 colors)
INSERT INTO enhanced_inventory_items (user_id, name, description, category, subcategory, price_group, vendor_id, pricing_method, quantity, cost_price, selling_price, reorder_point, active)
VALUES
  ('32a92783-f482-4e3d-8ebf-c292200674e5', 'Basswood 25mm - Stark (balta)', 'Medinė lamelė 25mm Basswood - Stark spalva', 'material', 'venetian_slats', 'BASSWOOD_25', 'f7e8d9c0-1234-5678-9abc-def012345678', 'price_grid', 0, 0, 0, 0, true),
  ('32a92783-f482-4e3d-8ebf-c292200674e5', 'Basswood 25mm - Natural', 'Medinė lamelė 25mm Basswood - Natural spalva', 'material', 'venetian_slats', 'BASSWOOD_25', 'f7e8d9c0-1234-5678-9abc-def012345678', 'price_grid', 0, 0, 0, 0, true),
  ('32a92783-f482-4e3d-8ebf-c292200674e5', 'Basswood 25mm - Light Oak', 'Medinė lamelė 25mm Basswood - Light Oak spalva', 'material', 'venetian_slats', 'BASSWOOD_25', 'f7e8d9c0-1234-5678-9abc-def012345678', 'price_grid', 0, 0, 0, 0, true),
  ('32a92783-f482-4e3d-8ebf-c292200674e5', 'Basswood 25mm - Golden Oak', 'Medinė lamelė 25mm Basswood - Golden Oak spalva', 'material', 'venetian_slats', 'BASSWOOD_25', 'f7e8d9c0-1234-5678-9abc-def012345678', 'price_grid', 0, 0, 0, 0, true),
  ('32a92783-f482-4e3d-8ebf-c292200674e5', 'Basswood 25mm - Yarrin', 'Medinė lamelė 25mm Basswood - Yarrin spalva', 'material', 'venetian_slats', 'BASSWOOD_25', 'f7e8d9c0-1234-5678-9abc-def012345678', 'price_grid', 0, 0, 0, 0, true),
  ('32a92783-f482-4e3d-8ebf-c292200674e5', 'Basswood 25mm - Walnut', 'Medinė lamelė 25mm Basswood - Walnut spalva', 'material', 'venetian_slats', 'BASSWOOD_25', 'f7e8d9c0-1234-5678-9abc-def012345678', 'price_grid', 0, 0, 0, 0, true),
  ('32a92783-f482-4e3d-8ebf-c292200674e5', 'Basswood 25mm - Mystic (antracitas)', 'Medinė lamelė 25mm Basswood - Mystic spalva', 'material', 'venetian_slats', 'BASSWOOD_25', 'f7e8d9c0-1234-5678-9abc-def012345678', 'price_grid', 0, 0, 0, 0, true);

-- 25mm Bamboo (9 colors)
INSERT INTO enhanced_inventory_items (user_id, name, description, category, subcategory, price_group, vendor_id, pricing_method, quantity, cost_price, selling_price, reorder_point, active)
VALUES
  ('32a92783-f482-4e3d-8ebf-c292200674e5', 'Bamboo 25mm - Haze', 'Bambukinė lamelė 25mm - Haze spalva', 'material', 'venetian_slats', 'BAMBOO_25', 'f7e8d9c0-1234-5678-9abc-def012345678', 'price_grid', 0, 0, 0, 0, true),
  ('32a92783-f482-4e3d-8ebf-c292200674e5', 'Bamboo 25mm - Armour', 'Bambukinė lamelė 25mm - Armour spalva', 'material', 'venetian_slats', 'BAMBOO_25', 'f7e8d9c0-1234-5678-9abc-def012345678', 'price_grid', 0, 0, 0, 0, true),
  ('32a92783-f482-4e3d-8ebf-c292200674e5', 'Bamboo 25mm - Cinder', 'Bambukinė lamelė 25mm - Cinder spalva', 'material', 'venetian_slats', 'BAMBOO_25', 'f7e8d9c0-1234-5678-9abc-def012345678', 'price_grid', 0, 0, 0, 0, true),
  ('32a92783-f482-4e3d-8ebf-c292200674e5', 'Bamboo 25mm - Zaya', 'Bambukinė lamelė 25mm - Zaya spalva', 'material', 'venetian_slats', 'BAMBOO_25', 'f7e8d9c0-1234-5678-9abc-def012345678', 'price_grid', 0, 0, 0, 0, true),
  ('32a92783-f482-4e3d-8ebf-c292200674e5', 'Bamboo 25mm - Neo', 'Bambukinė lamelė 25mm - Neo spalva', 'material', 'venetian_slats', 'BAMBOO_25', 'f7e8d9c0-1234-5678-9abc-def012345678', 'price_grid', 0, 0, 0, 0, true),
  ('32a92783-f482-4e3d-8ebf-c292200674e5', 'Bamboo 25mm - Karri', 'Bambukinė lamelė 25mm - Karri spalva', 'material', 'venetian_slats', 'BAMBOO_25', 'f7e8d9c0-1234-5678-9abc-def012345678', 'price_grid', 0, 0, 0, 0, true),
  ('32a92783-f482-4e3d-8ebf-c292200674e5', 'Bamboo 25mm - Arcana', 'Bambukinė lamelė 25mm - Arcana spalva', 'material', 'venetian_slats', 'BAMBOO_25', 'f7e8d9c0-1234-5678-9abc-def012345678', 'price_grid', 0, 0, 0, 0, true),
  ('32a92783-f482-4e3d-8ebf-c292200674e5', 'Bamboo 25mm - Danta', 'Bambukinė lamelė 25mm - Danta spalva', 'material', 'venetian_slats', 'BAMBOO_25', 'f7e8d9c0-1234-5678-9abc-def012345678', 'price_grid', 0, 0, 0, 0, true),
  ('32a92783-f482-4e3d-8ebf-c292200674e5', 'Bamboo 25mm - Mari', 'Bambukinė lamelė 25mm - Mari spalva', 'material', 'venetian_slats', 'BAMBOO_25', 'f7e8d9c0-1234-5678-9abc-def012345678', 'price_grid', 0, 0, 0, 0, true);

-- 50mm Basswood (14 colors)
INSERT INTO enhanced_inventory_items (user_id, name, description, category, subcategory, price_group, vendor_id, pricing_method, quantity, cost_price, selling_price, reorder_point, active)
VALUES
  ('32a92783-f482-4e3d-8ebf-c292200674e5', 'Basswood 50mm - Stark', 'Medinė lamelė 50mm Basswood - Stark spalva', 'material', 'venetian_slats', 'BASSWOOD_50', 'f7e8d9c0-1234-5678-9abc-def012345678', 'price_grid', 0, 0, 0, 0, true),
  ('32a92783-f482-4e3d-8ebf-c292200674e5', 'Basswood 50mm - Soft White', 'Medinė lamelė 50mm Basswood - Soft White spalva', 'material', 'venetian_slats', 'BASSWOOD_50', 'f7e8d9c0-1234-5678-9abc-def012345678', 'price_grid', 0, 0, 0, 0, true),
  ('32a92783-f482-4e3d-8ebf-c292200674e5', 'Basswood 50mm - Alpine', 'Medinė lamelė 50mm Basswood - Alpine spalva', 'material', 'venetian_slats', 'BASSWOOD_50', 'f7e8d9c0-1234-5678-9abc-def012345678', 'price_grid', 0, 0, 0, 0, true),
  ('32a92783-f482-4e3d-8ebf-c292200674e5', 'Basswood 50mm - Alabaster', 'Medinė lamelė 50mm Basswood - Alabaster spalva', 'material', 'venetian_slats', 'BASSWOOD_50', 'f7e8d9c0-1234-5678-9abc-def012345678', 'price_grid', 0, 0, 0, 0, true),
  ('32a92783-f482-4e3d-8ebf-c292200674e5', 'Basswood 50mm - Light Oak', 'Medinė lamelė 50mm Basswood - Light Oak spalva', 'material', 'venetian_slats', 'BASSWOOD_50', 'f7e8d9c0-1234-5678-9abc-def012345678', 'price_grid', 0, 0, 0, 0, true),
  ('32a92783-f482-4e3d-8ebf-c292200674e5', 'Basswood 50mm - Natural', 'Medinė lamelė 50mm Basswood - Natural spalva', 'material', 'venetian_slats', 'BASSWOOD_50', 'f7e8d9c0-1234-5678-9abc-def012345678', 'price_grid', 0, 0, 0, 0, true),
  ('32a92783-f482-4e3d-8ebf-c292200674e5', 'Basswood 50mm - Golden Oak', 'Medinė lamelė 50mm Basswood - Golden Oak spalva', 'material', 'venetian_slats', 'BASSWOOD_50', 'f7e8d9c0-1234-5678-9abc-def012345678', 'price_grid', 0, 0, 0, 0, true),
  ('32a92783-f482-4e3d-8ebf-c292200674e5', 'Basswood 50mm - Clay', 'Medinė lamelė 50mm Basswood - Clay spalva', 'material', 'venetian_slats', 'BASSWOOD_50', 'f7e8d9c0-1234-5678-9abc-def012345678', 'price_grid', 0, 0, 0, 0, true),
  ('32a92783-f482-4e3d-8ebf-c292200674e5', 'Basswood 50mm - Storm', 'Medinė lamelė 50mm Basswood - Storm spalva', 'material', 'venetian_slats', 'BASSWOOD_50', 'f7e8d9c0-1234-5678-9abc-def012345678', 'price_grid', 0, 0, 0, 0, true),
  ('32a92783-f482-4e3d-8ebf-c292200674e5', 'Basswood 50mm - Yarrin', 'Medinė lamelė 50mm Basswood - Yarrin spalva', 'material', 'venetian_slats', 'BASSWOOD_50', 'f7e8d9c0-1234-5678-9abc-def012345678', 'price_grid', 0, 0, 0, 0, true),
  ('32a92783-f482-4e3d-8ebf-c292200674e5', 'Basswood 50mm - Sin', 'Medinė lamelė 50mm Basswood - Sin spalva', 'material', 'venetian_slats', 'BASSWOOD_50', 'f7e8d9c0-1234-5678-9abc-def012345678', 'price_grid', 0, 0, 0, 0, true),
  ('32a92783-f482-4e3d-8ebf-c292200674e5', 'Basswood 50mm - Walnut', 'Medinė lamelė 50mm Basswood - Walnut spalva', 'material', 'venetian_slats', 'BASSWOOD_50', 'f7e8d9c0-1234-5678-9abc-def012345678', 'price_grid', 0, 0, 0, 0, true),
  ('32a92783-f482-4e3d-8ebf-c292200674e5', 'Basswood 50mm - Linen', 'Medinė lamelė 50mm Basswood - Linen spalva', 'material', 'venetian_slats', 'BASSWOOD_50', 'f7e8d9c0-1234-5678-9abc-def012345678', 'price_grid', 0, 0, 0, 0, true),
  ('32a92783-f482-4e3d-8ebf-c292200674e5', 'Basswood 50mm - Mystic', 'Medinė lamelė 50mm Basswood - Mystic spalva', 'material', 'venetian_slats', 'BASSWOOD_50', 'f7e8d9c0-1234-5678-9abc-def012345678', 'price_grid', 0, 0, 0, 0, true);

-- 50mm Bamboo (16 colors)
INSERT INTO enhanced_inventory_items (user_id, name, description, category, subcategory, price_group, vendor_id, pricing_method, quantity, cost_price, selling_price, reorder_point, active)
VALUES
  ('32a92783-f482-4e3d-8ebf-c292200674e5', 'Bamboo 50mm - Innocent', 'Bambukinė lamelė 50mm - Innocent spalva', 'material', 'venetian_slats', 'BAMBOO_50', 'f7e8d9c0-1234-5678-9abc-def012345678', 'price_grid', 0, 0, 0, 0, true),
  ('32a92783-f482-4e3d-8ebf-c292200674e5', 'Bamboo 50mm - Flax', 'Bambukinė lamelė 50mm - Flax spalva', 'material', 'venetian_slats', 'BAMBOO_50', 'f7e8d9c0-1234-5678-9abc-def012345678', 'price_grid', 0, 0, 0, 0, true),
  ('32a92783-f482-4e3d-8ebf-c292200674e5', 'Bamboo 50mm - Haze', 'Bambukinė lamelė 50mm - Haze spalva', 'material', 'venetian_slats', 'BAMBOO_50', 'f7e8d9c0-1234-5678-9abc-def012345678', 'price_grid', 0, 0, 0, 0, true),
  ('32a92783-f482-4e3d-8ebf-c292200674e5', 'Bamboo 50mm - Armour', 'Bambukinė lamelė 50mm - Armour spalva', 'material', 'venetian_slats', 'BAMBOO_50', 'f7e8d9c0-1234-5678-9abc-def012345678', 'price_grid', 0, 0, 0, 0, true),
  ('32a92783-f482-4e3d-8ebf-c292200674e5', 'Bamboo 50mm - Cinder', 'Bambukinė lamelė 50mm - Cinder spalva', 'material', 'venetian_slats', 'BAMBOO_50', 'f7e8d9c0-1234-5678-9abc-def012345678', 'price_grid', 0, 0, 0, 0, true),
  ('32a92783-f482-4e3d-8ebf-c292200674e5', 'Bamboo 50mm - Cyber', 'Bambukinė lamelė 50mm - Cyber spalva', 'material', 'venetian_slats', 'BAMBOO_50', 'f7e8d9c0-1234-5678-9abc-def012345678', 'price_grid', 0, 0, 0, 0, true),
  ('32a92783-f482-4e3d-8ebf-c292200674e5', 'Bamboo 50mm - Mari', 'Bambukinė lamelė 50mm - Mari spalva', 'material', 'venetian_slats', 'BAMBOO_50', 'f7e8d9c0-1234-5678-9abc-def012345678', 'price_grid', 0, 0, 0, 0, true),
  ('32a92783-f482-4e3d-8ebf-c292200674e5', 'Bamboo 50mm - Danta', 'Bambukinė lamelė 50mm - Danta spalva', 'material', 'venetian_slats', 'BAMBOO_50', 'f7e8d9c0-1234-5678-9abc-def012345678', 'price_grid', 0, 0, 0, 0, true),
  ('32a92783-f482-4e3d-8ebf-c292200674e5', 'Bamboo 50mm - Arcana', 'Bambukinė lamelė 50mm - Arcana spalva', 'material', 'venetian_slats', 'BAMBOO_50', 'f7e8d9c0-1234-5678-9abc-def012345678', 'price_grid', 0, 0, 0, 0, true),
  ('32a92783-f482-4e3d-8ebf-c292200674e5', 'Bamboo 50mm - Karri', 'Bambukinė lamelė 50mm - Karri spalva', 'material', 'venetian_slats', 'BAMBOO_50', 'f7e8d9c0-1234-5678-9abc-def012345678', 'price_grid', 0, 0, 0, 0, true),
  ('32a92783-f482-4e3d-8ebf-c292200674e5', 'Bamboo 50mm - Neo', 'Bambukinė lamelė 50mm - Neo spalva', 'material', 'venetian_slats', 'BAMBOO_50', 'f7e8d9c0-1234-5678-9abc-def012345678', 'price_grid', 0, 0, 0, 0, true),
  ('32a92783-f482-4e3d-8ebf-c292200674e5', 'Bamboo 50mm - Zaya', 'Bambukinė lamelė 50mm - Zaya spalva', 'material', 'venetian_slats', 'BAMBOO_50', 'f7e8d9c0-1234-5678-9abc-def012345678', 'price_grid', 0, 0, 0, 0, true),
  ('32a92783-f482-4e3d-8ebf-c292200674e5', 'Bamboo 50mm - Mosaic', 'Bambukinė lamelė 50mm - Mosaic spalva', 'material', 'venetian_slats', 'BAMBOO_50', 'f7e8d9c0-1234-5678-9abc-def012345678', 'price_grid', 0, 0, 0, 0, true),
  ('32a92783-f482-4e3d-8ebf-c292200674e5', 'Bamboo 50mm - Sahara', 'Bambukinė lamelė 50mm - Sahara spalva', 'material', 'venetian_slats', 'BAMBOO_50', 'f7e8d9c0-1234-5678-9abc-def012345678', 'price_grid', 0, 0, 0, 0, true),
  ('32a92783-f482-4e3d-8ebf-c292200674e5', 'Bamboo 50mm - Timber', 'Bambukinė lamelė 50mm - Timber spalva', 'material', 'venetian_slats', 'BAMBOO_50', 'f7e8d9c0-1234-5678-9abc-def012345678', 'price_grid', 0, 0, 0, 0, true),
  ('32a92783-f482-4e3d-8ebf-c292200674e5', 'Bamboo 50mm - Walnut', 'Bambukinė lamelė 50mm - Walnut spalva', 'material', 'venetian_slats', 'BAMBOO_50', 'f7e8d9c0-1234-5678-9abc-def012345678', 'price_grid', 0, 0, 0, 0, true);

-- 50mm Abachi (4 colors)
INSERT INTO enhanced_inventory_items (user_id, name, description, category, subcategory, price_group, vendor_id, pricing_method, quantity, cost_price, selling_price, reorder_point, active)
VALUES
  ('32a92783-f482-4e3d-8ebf-c292200674e5', 'Abachi 50mm - Elkin', 'Abachi medinė lamelė 50mm - Elkin spalva', 'material', 'venetian_slats', 'ABACHI_50', 'f7e8d9c0-1234-5678-9abc-def012345678', 'price_grid', 0, 0, 0, 0, true),
  ('32a92783-f482-4e3d-8ebf-c292200674e5', 'Abachi 50mm - Kota', 'Abachi medinė lamelė 50mm - Kota spalva', 'material', 'venetian_slats', 'ABACHI_50', 'f7e8d9c0-1234-5678-9abc-def012345678', 'price_grid', 0, 0, 0, 0, true),
  ('32a92783-f482-4e3d-8ebf-c292200674e5', 'Abachi 50mm - Hibano', 'Abachi medinė lamelė 50mm - Hibano spalva', 'material', 'venetian_slats', 'ABACHI_50', 'f7e8d9c0-1234-5678-9abc-def012345678', 'price_grid', 0, 0, 0, 0, true),
  ('32a92783-f482-4e3d-8ebf-c292200674e5', 'Abachi 50mm - Aro', 'Abachi medinė lamelė 50mm - Aro spalva', 'material', 'venetian_slats', 'ABACHI_50', 'f7e8d9c0-1234-5678-9abc-def012345678', 'price_grid', 0, 0, 0, 0, true);

-- 50mm Paulownia (8 colors)
INSERT INTO enhanced_inventory_items (user_id, name, description, category, subcategory, price_group, vendor_id, pricing_method, quantity, cost_price, selling_price, reorder_point, active)
VALUES
  ('32a92783-f482-4e3d-8ebf-c292200674e5', 'Paulownia 50mm - Lavanco', 'Paulownia medinė lamelė 50mm - Lavanco spalva', 'material', 'venetian_slats', 'PAULOWNIA_50', 'f7e8d9c0-1234-5678-9abc-def012345678', 'price_grid', 0, 0, 0, 0, true),
  ('32a92783-f482-4e3d-8ebf-c292200674e5', 'Paulownia 50mm - Nubo', 'Paulownia medinė lamelė 50mm - Nubo spalva', 'material', 'venetian_slats', 'PAULOWNIA_50', 'f7e8d9c0-1234-5678-9abc-def012345678', 'price_grid', 0, 0, 0, 0, true),
  ('32a92783-f482-4e3d-8ebf-c292200674e5', 'Paulownia 50mm - Helgriza', 'Paulownia medinė lamelė 50mm - Helgriza spalva', 'material', 'venetian_slats', 'PAULOWNIA_50', 'f7e8d9c0-1234-5678-9abc-def012345678', 'price_grid', 0, 0, 0, 0, true),
  ('32a92783-f482-4e3d-8ebf-c292200674e5', 'Paulownia 50mm - Tamno', 'Paulownia medinė lamelė 50mm - Tamno spalva', 'material', 'venetian_slats', 'PAULOWNIA_50', 'f7e8d9c0-1234-5678-9abc-def012345678', 'price_grid', 0, 0, 0, 0, true),
  ('32a92783-f482-4e3d-8ebf-c292200674e5', 'Paulownia 50mm - Malummo', 'Paulownia medinė lamelė 50mm - Malummo spalva', 'material', 'venetian_slats', 'PAULOWNIA_50', 'f7e8d9c0-1234-5678-9abc-def012345678', 'price_grid', 0, 0, 0, 0, true),
  ('32a92783-f482-4e3d-8ebf-c292200674e5', 'Paulownia 50mm - Skanda', 'Paulownia medinė lamelė 50mm - Skanda spalva', 'material', 'venetian_slats', 'PAULOWNIA_50', 'f7e8d9c0-1234-5678-9abc-def012345678', 'price_grid', 0, 0, 0, 0, true),
  ('32a92783-f482-4e3d-8ebf-c292200674e5', 'Paulownia 50mm - Medus', 'Paulownia medinė lamelė 50mm - Medus spalva', 'material', 'venetian_slats', 'PAULOWNIA_50', 'f7e8d9c0-1234-5678-9abc-def012345678', 'price_grid', 0, 0, 0, 0, true),
  ('32a92783-f482-4e3d-8ebf-c292200674e5', 'Paulownia 50mm - Bruli', 'Paulownia medinė lamelė 50mm - Bruli spalva', 'material', 'venetian_slats', 'PAULOWNIA_50', 'f7e8d9c0-1234-5678-9abc-def012345678', 'price_grid', 0, 0, 0, 0, true);
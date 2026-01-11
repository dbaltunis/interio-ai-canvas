
-- ============================================
-- HOMEKAARA COMPLETE SETUP MIGRATION (CORRECTED)
-- Account ID: 708d8e36-8fa3-4e07-b43b-c0a90941f991
-- ============================================

-- ============================================
-- 1. UPDATE STITCHING SERVICE PRICES IN INVENTORY
-- ============================================

-- Tailor Eyelet: ₹200/panel
UPDATE enhanced_inventory_items 
SET price_per_unit = 200, 
    metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{pricing_method}', '"per_panel"')
WHERE id = '971a7477-d3d6-4dfa-a22e-c790bdcef2b0';

-- Factory Eyelet: ₹225/panel  
UPDATE enhanced_inventory_items 
SET price_per_unit = 225,
    metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{pricing_method}', '"per_panel"')
WHERE id = '41856595-974c-4d13-b176-cf45a4883cb1';

-- Tailor Eyelet With Lining: ₹230/panel
UPDATE enhanced_inventory_items 
SET price_per_unit = 230,
    metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{pricing_method}', '"per_panel"')
WHERE id = '7b872c2a-fb57-47dc-99b9-b10e569e9f8b';

-- Factory Eyelet With Lining: ₹250/panel
UPDATE enhanced_inventory_items 
SET price_per_unit = 250,
    metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{pricing_method}', '"per_panel"')
WHERE id = '43348eb0-583d-41b2-92d6-48cfb1b74426';

-- Tailor Pleated: ₹150/panel
UPDATE enhanced_inventory_items 
SET price_per_unit = 150,
    metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{pricing_method}', '"per_panel"')
WHERE id = 'ecbf4146-698f-4722-b814-fe9b216d197e';

-- Factory Pleated: ₹250/panel
UPDATE enhanced_inventory_items 
SET price_per_unit = 250,
    metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{pricing_method}', '"per_panel"')
WHERE id = '639499aa-4ff6-4a0f-afa6-427e95cfcd57';

-- Tailor Rod Pocket: ₹150/panel
UPDATE enhanced_inventory_items 
SET price_per_unit = 150,
    metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{pricing_method}', '"per_panel"')
WHERE id = '343efc91-52a0-4291-8659-4f15a915b433';

-- Factory Rod Pocket: ₹180/panel
UPDATE enhanced_inventory_items 
SET price_per_unit = 180,
    metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{pricing_method}', '"per_panel"')
WHERE id = '909dc2b9-c98f-4eb0-9f9a-04e5c4ff1163';

-- Factory Wave: ₹300/panel
UPDATE enhanced_inventory_items 
SET price_per_unit = 300,
    metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{pricing_method}', '"per_panel"')
WHERE id = '85b8173f-b081-4a75-8808-e93ec988d806';

-- ============================================
-- 2. ADD NEW STITCHING SERVICES
-- ============================================

INSERT INTO enhanced_inventory_items (id, user_id, name, category, subcategory, price_per_unit, unit, metadata)
VALUES 
  (gen_random_uuid(), '708d8e36-8fa3-4e07-b43b-c0a90941f991', 'Tailor Pleated With Lining', 'services', 'stitching', 180, 'pieces', '{"pricing_method": "per_panel"}'::jsonb),
  (gen_random_uuid(), '708d8e36-8fa3-4e07-b43b-c0a90941f991', 'Factory Pleated With Lining', 'services', 'stitching', 280, 'pieces', '{"pricing_method": "per_panel"}'::jsonb),
  (gen_random_uuid(), '708d8e36-8fa3-4e07-b43b-c0a90941f991', 'Factory European Pleat', 'services', 'stitching', 450, 'pieces', '{"pricing_method": "per_panel"}'::jsonb),
  (gen_random_uuid(), '708d8e36-8fa3-4e07-b43b-c0a90941f991', 'Tailor Rod Pocket With Lining', 'services', 'stitching', 180, 'pieces', '{"pricing_method": "per_panel"}'::jsonb),
  (gen_random_uuid(), '708d8e36-8fa3-4e07-b43b-c0a90941f991', 'Factory Rod Pocket With Lining', 'services', 'stitching', 210, 'pieces', '{"pricing_method": "per_panel"}'::jsonb);

-- ============================================
-- 3. UPDATE ROMAN BLINDS LINING (existing ones)
-- ============================================

UPDATE option_values SET 
  label = 'Basique', 
  code = 'basique',
  extra_data = '{"price": 240, "pricing_method": "per_running_meter"}'::jsonb
WHERE id = 'b7d863d3-a90d-495c-9241-8d70b4002558';

UPDATE option_values SET 
  label = 'Modique', 
  code = 'modique',
  extra_data = '{"price": 340, "pricing_method": "per_running_meter"}'::jsonb
WHERE id = '116f00b1-2fee-4ea0-9a29-6fada74e728c';

-- Add missing lining types with account_id
INSERT INTO option_values (id, option_id, label, code, order_index, extra_data, account_id)
VALUES 
  (gen_random_uuid(), 'a3669486-2a7d-4453-93f3-e16987b5cda8', 'Oblique', 'oblique', 3, '{"price": 440, "pricing_method": "per_running_meter"}'::jsonb, '708d8e36-8fa3-4e07-b43b-c0a90941f991'),
  (gen_random_uuid(), 'a3669486-2a7d-4453-93f3-e16987b5cda8', 'Darque', 'darque', 4, '{"price": 340, "pricing_method": "per_running_meter"}'::jsonb, '708d8e36-8fa3-4e07-b43b-c0a90941f991'),
  (gen_random_uuid(), 'a3669486-2a7d-4453-93f3-e16987b5cda8', 'Metalique', 'metalique', 5, '{"price": 640, "pricing_method": "per_running_meter"}'::jsonb, '708d8e36-8fa3-4e07-b43b-c0a90941f991');

-- ============================================
-- 4. UPDATE TIE-BACK OPTIONS WITH FABRIC CONSUMPTION
-- ============================================

UPDATE option_values SET 
  extra_data = '{"price": 0, "pricing_method": "fixed", "fabric_per_tie": 0}'::jsonb
WHERE id = '3043aa05-435e-42bc-adf0-61b7cb11638b';

UPDATE option_values SET 
  extra_data = '{"price": 0, "pricing_method": "fixed", "fabric_per_tie": 0.35, "description": "0.35m fabric per tie"}'::jsonb
WHERE id = '466c29d1-48c5-4e42-bf42-7a86870c2113';

UPDATE option_values SET 
  extra_data = '{"price": 30, "pricing_method": "per_tie", "fabric_per_tie": 0.45, "description": "0.45m fabric + ₹30 stitching per tie"}'::jsonb
WHERE id = '81a2d80f-c0ec-428f-ba97-b56617bfc1c9';

-- ============================================
-- 5. UPDATE HEADRAIL OPTIONS WITH MIN WIDTH DATA
-- ============================================

UPDATE option_values SET 
  extra_data = '{"price": 800, "pricing_method": "per_running_foot", "min_width_rft": 3}'::jsonb
WHERE id = 'e5149542-7575-4e97-8dd9-b2ddc8ad0504';

UPDATE option_values SET 
  extra_data = '{"price": 1160, "pricing_method": "per_running_foot", "min_width_rft": 3}'::jsonb
WHERE id = '72002109-d2cf-4d04-b473-c43765a5e511';

UPDATE option_values SET 
  extra_data = '{"price": 8000, "pricing_method": "per_running_foot", "min_width_rft": 4, "rounding_interval": 0.5}'::jsonb
WHERE id = 'c4fb046b-e077-4ee2-b330-e650cc0b0a15';

UPDATE option_values SET 
  extra_data = '{"price": 1400, "pricing_method": "per_running_foot", "min_width_rft": 6, "rounding_interval": 0.5}'::jsonb
WHERE id = 'b879048d-25a4-4793-8887-a02a389ba953';

-- ============================================
-- 6. TAG EXISTING WHITE CHAIN LENGTHS
-- ============================================

UPDATE option_values SET 
  extra_data = jsonb_set(COALESCE(extra_data, '{}'::jsonb), '{chain_type}', '"white"')
WHERE id IN ('7ebd6846-9577-4bf4-bb8d-3a75c7ea345c', '238572fa-08b7-4edb-af65-ac081938a35a', 'bd342968-ca63-4258-88c4-c901664ef942');

-- Phase 2: Create Treatment Options for Hardware Selection (For Homekaara account)

-- Step 2.1: Create Mount Type option
INSERT INTO public.treatment_options (
  key, label, input_type, required, visible, order_index, 
  treatment_category, tracks_inventory, account_id, source
) VALUES (
  'mount_type', 'Mount Type', 'select', false, true, 50,
  'curtains', false, '708d8e36-8fa3-4e07-b43b-c0a90941f991', 'user'
);

-- Step 2.2: Create Hardware Type option (Track vs Rod)
INSERT INTO public.treatment_options (
  key, label, input_type, required, visible, order_index,
  treatment_category, tracks_inventory, account_id, source
) VALUES (
  'hardware_type', 'Hardware Type', 'select', false, true, 51,
  'curtains', false, '708d8e36-8fa3-4e07-b43b-c0a90941f991', 'user'
);

-- Step 2.3: Create Track Selection option (linked to inventory)
INSERT INTO public.treatment_options (
  key, label, input_type, required, visible, order_index,
  treatment_category, tracks_inventory, account_id, source
) VALUES (
  'track_selection', 'Select Track', 'select', false, true, 52,
  'curtains', true, '708d8e36-8fa3-4e07-b43b-c0a90941f991', 'user'
);

-- Step 2.4: Create Rod Selection option (linked to inventory)
INSERT INTO public.treatment_options (
  key, label, input_type, required, visible, order_index,
  treatment_category, tracks_inventory, account_id, source
) VALUES (
  'rod_selection', 'Select Rod', 'select', false, true, 53,
  'curtains', true, '708d8e36-8fa3-4e07-b43b-c0a90941f991', 'user'
);

-- Now create the option values for mount_type
INSERT INTO public.option_values (option_id, label, code, order_index, extra_data, account_id)
SELECT 
  to2.id,
  v.label,
  v.code,
  v.order_index,
  v.extra_data::jsonb,
  '708d8e36-8fa3-4e07-b43b-c0a90941f991'::uuid
FROM treatment_options to2
CROSS JOIN (VALUES 
  ('Ceiling Mount', 'ceiling', 1, '{"description": "Track/Rod mounted to ceiling"}'),
  ('Wall Mount', 'wall', 2, '{"description": "Track/Rod mounted to wall"}'),
  ('Ceiling & Wall', 'ceiling_wall', 3, '{"description": "Compatible with both mounting types"}')
) AS v(label, code, order_index, extra_data)
WHERE to2.key = 'mount_type' 
  AND to2.account_id = '708d8e36-8fa3-4e07-b43b-c0a90941f991';

-- Create option values for hardware_type
INSERT INTO public.option_values (option_id, label, code, order_index, extra_data, account_id)
SELECT 
  to2.id,
  v.label,
  v.code,
  v.order_index,
  v.extra_data::jsonb,
  '708d8e36-8fa3-4e07-b43b-c0a90941f991'::uuid
FROM treatment_options to2
CROSS JOIN (VALUES 
  ('Track', 'track', 1, '{"description": "Curtain track system", "icon": "rail"}'),
  ('Rod', 'rod', 2, '{"description": "Curtain rod/pole system", "icon": "circle"}')
) AS v(label, code, order_index, extra_data)
WHERE to2.key = 'hardware_type' 
  AND to2.account_id = '708d8e36-8fa3-4e07-b43b-c0a90941f991';

-- Create option values for track_selection from inventory (using 'active' not 'is_active')
INSERT INTO public.option_values (option_id, label, code, order_index, extra_data, inventory_item_id, account_id)
SELECT 
  to2.id,
  eii.name,
  eii.id::text,
  ROW_NUMBER() OVER (ORDER BY eii.name)::int,
  jsonb_build_object(
    'inventory_item_id', eii.id,
    'price', eii.selling_price,
    'cost', eii.cost_price,
    'mount_type', eii.hardware_mounting_type,
    'brand', eii.metadata->>'brand',
    'accessory_prices', eii.metadata->'accessory_prices',
    'pricing_method', 'per_linear_foot'
  ),
  eii.id,
  '708d8e36-8fa3-4e07-b43b-c0a90941f991'::uuid
FROM treatment_options to2
CROSS JOIN enhanced_inventory_items eii
WHERE to2.key = 'track_selection' 
  AND to2.account_id = '708d8e36-8fa3-4e07-b43b-c0a90941f991'
  AND eii.user_id = '708d8e36-8fa3-4e07-b43b-c0a90941f991'
  AND eii.category = 'hardware'
  AND eii.subcategory = 'track'
  AND eii.active = true;

-- Create option values for rod_selection from inventory
INSERT INTO public.option_values (option_id, label, code, order_index, extra_data, inventory_item_id, account_id)
SELECT 
  to2.id,
  eii.name,
  eii.id::text,
  ROW_NUMBER() OVER (ORDER BY eii.name)::int,
  jsonb_build_object(
    'inventory_item_id', eii.id,
    'price', eii.selling_price,
    'cost', eii.cost_price,
    'mount_type', eii.hardware_mounting_type,
    'brand', eii.metadata->>'brand',
    'accessory_prices', eii.metadata->'accessory_prices',
    'pricing_method', 'per_linear_foot'
  ),
  eii.id,
  '708d8e36-8fa3-4e07-b43b-c0a90941f991'::uuid
FROM treatment_options to2
CROSS JOIN enhanced_inventory_items eii
WHERE to2.key = 'rod_selection' 
  AND to2.account_id = '708d8e36-8fa3-4e07-b43b-c0a90941f991'
  AND eii.user_id = '708d8e36-8fa3-4e07-b43b-c0a90941f991'
  AND eii.category = 'hardware'
  AND eii.subcategory = 'rod'
  AND eii.active = true;
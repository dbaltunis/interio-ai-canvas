
-- HOMEKAARA CURTAINS: ROD POCKET RULE + PLEATED WITH RINGS HEADING

-- 1. ADD MISSING ROD POCKET RULE
INSERT INTO option_rules (id, template_id, condition, effect, description)
VALUES (
  gen_random_uuid(),
  'ac3cfd19-05d2-4641-8d54-43a95b3b6eb7',
  '{"operator": "equals", "option_key": "selected_heading", "value": "78fe81dd-491a-400a-a5f2-a9bf1374f66e"}',
  '{"action": "set_default", "target_option_key": "hardware_type", "target_value": "bf7cb9ae-3208-4d6a-b941-91d9c467c1db"}',
  'Default hardware type to Rod when Rod Pocket heading is selected'
);

-- 2. CREATE "PLEATED (WITH RINGS)" HEADING
INSERT INTO enhanced_inventory_items (
  id, user_id, name, category, subcategory,
  metadata, cost_price, selling_price, active, fullness_ratio
) VALUES (
  'a1b2c3d4-5e6f-7890-abcd-ef1234567890',
  '708d8e36-8fa3-4e07-b43b-c0a90941f991',
  'Pleated (with rings)',
  'heading',
  'heading',
  '{"compatible_hardware": ["rod"], "twc_code": "pleated_rings"}',
  0, 0, true, 2.5
);

-- 3. ADD RULE FOR PLEATED (WITH RINGS) → ROD
INSERT INTO option_rules (id, template_id, condition, effect, description)
VALUES (
  gen_random_uuid(),
  'ac3cfd19-05d2-4641-8d54-43a95b3b6eb7',
  '{"operator": "equals", "option_key": "selected_heading", "value": "a1b2c3d4-5e6f-7890-abcd-ef1234567890"}',
  '{"action": "set_default", "target_option_key": "hardware_type", "target_value": "bf7cb9ae-3208-4d6a-b941-91d9c467c1db"}',
  'Default hardware type to Rod when Pleated (with rings) heading is selected'
);

-- 4. UPDATE CURTAINS TEMPLATE TO INCLUDE NEW HEADING
UPDATE curtain_templates
SET selected_heading_ids = array_append(selected_heading_ids, 'a1b2c3d4-5e6f-7890-abcd-ef1234567890'::uuid)
WHERE id = 'ac3cfd19-05d2-4641-8d54-43a95b3b6eb7';

-- 5. CREATE ACCESSORY OPTIONS (using 'boolean' instead of 'checkbox')
INSERT INTO treatment_options (id, treatment_category, key, label, input_type, required, visible, order_index, account_id, pricing_method, base_price, pricing_rules) VALUES
(gen_random_uuid(), 'curtains', 'runners', 'Runners', 'number', false, false, 100, '708d8e36-8fa3-4e07-b43b-c0a90941f991', 'per_unit', 10.00, '{"formula": "ceil(width_ft * 6)", "double_multiplier": 2}'),
(gen_random_uuid(), 'curtains', 'magnet', 'Magnet', 'boolean', false, false, 101, '708d8e36-8fa3-4e07-b43b-c0a90941f991', 'per_window', 250.00, '{"formula": "quantity"}'),
(gen_random_uuid(), 'curtains', 'jointers', 'Jointers', 'number', false, false, 102, '708d8e36-8fa3-4e07-b43b-c0a90941f991', 'per_unit', 260.00, '{"formula": "ceil(width_ft / 5)"}'),
(gen_random_uuid(), 'curtains', 'end_caps', 'End Caps', 'number', false, false, 103, '708d8e36-8fa3-4e07-b43b-c0a90941f991', 'per_pair', 64.00, '{"formula": "num_tracks"}'),
(gen_random_uuid(), 'curtains', 'brackets', 'Brackets', 'select', false, true, 104, '708d8e36-8fa3-4e07-b43b-c0a90941f991', 'per_unit', null, '{"formula": "ceil(width_ft / 2)"}'),
(gen_random_uuid(), 'curtains', 'wand', 'Wand', 'boolean', false, false, 105, '708d8e36-8fa3-4e07-b43b-c0a90941f991', 'per_unit', 2080.00, '{"formula": "quantity"}'),
(gen_random_uuid(), 'curtains', 'track_packaging', 'Track Packaging', 'number', false, false, 106, '708d8e36-8fa3-4e07-b43b-c0a90941f991', 'per_unit', 10.00, '{"formula": "ceil(width_ft / 5)"}'),
(gen_random_uuid(), 'curtains', 'track_overlap', 'Track Overlap Arms', 'boolean', false, false, 108, '708d8e36-8fa3-4e07-b43b-c0a90941f991', 'per_unit', 520.00, '{"formula": "is_double ? 2 : 1"}');

-- 6. ADD ACCESSORY VISIBILITY RULES (show when Track is selected)
INSERT INTO option_rules (id, template_id, condition, effect, description) VALUES
(gen_random_uuid(), 'ac3cfd19-05d2-4641-8d54-43a95b3b6eb7', '{"operator": "equals", "option_key": "hardware_type", "value": "8faed36c-5c41-4838-9d32-e0d1a9d4f300"}', '{"action": "show_option", "target_option_key": "runners"}', 'Show runners when Track selected'),
(gen_random_uuid(), 'ac3cfd19-05d2-4641-8d54-43a95b3b6eb7', '{"operator": "equals", "option_key": "hardware_type", "value": "8faed36c-5c41-4838-9d32-e0d1a9d4f300"}', '{"action": "show_option", "target_option_key": "magnet"}', 'Show magnet when Track selected'),
(gen_random_uuid(), 'ac3cfd19-05d2-4641-8d54-43a95b3b6eb7', '{"operator": "equals", "option_key": "hardware_type", "value": "8faed36c-5c41-4838-9d32-e0d1a9d4f300"}', '{"action": "show_option", "target_option_key": "jointers"}', 'Show jointers when Track selected'),
(gen_random_uuid(), 'ac3cfd19-05d2-4641-8d54-43a95b3b6eb7', '{"operator": "equals", "option_key": "hardware_type", "value": "8faed36c-5c41-4838-9d32-e0d1a9d4f300"}', '{"action": "show_option", "target_option_key": "end_caps"}', 'Show end caps when Track selected'),
(gen_random_uuid(), 'ac3cfd19-05d2-4641-8d54-43a95b3b6eb7', '{"operator": "equals", "option_key": "hardware_type", "value": "8faed36c-5c41-4838-9d32-e0d1a9d4f300"}', '{"action": "show_option", "target_option_key": "wand"}', 'Show wand when Track selected'),
(gen_random_uuid(), 'ac3cfd19-05d2-4641-8d54-43a95b3b6eb7', '{"operator": "equals", "option_key": "hardware_type", "value": "8faed36c-5c41-4838-9d32-e0d1a9d4f300"}', '{"action": "show_option", "target_option_key": "track_packaging"}', 'Show packaging when Track selected'),
(gen_random_uuid(), 'ac3cfd19-05d2-4641-8d54-43a95b3b6eb7', '{"operator": "equals", "option_key": "hardware_type", "value": "8faed36c-5c41-4838-9d32-e0d1a9d4f300"}', '{"action": "show_option", "target_option_key": "track_overlap"}', 'Show overlap when Track selected');

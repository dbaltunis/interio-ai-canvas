-- Seed basic treatment options for missing categories

-- ROMAN BLINDS OPTIONS
INSERT INTO treatment_options (treatment_category, key, label, input_type, required, visible, order_index, is_system_default)
VALUES 
  ('roman_blinds', 'lift_system', 'Lift System', 'select', true, true, 1, true),
  ('roman_blinds', 'fold_style', 'Fold Style', 'select', true, true, 2, true),
  ('roman_blinds', 'lining', 'Lining', 'select', false, true, 3, true)
ON CONFLICT DO NOTHING;

-- Roman Blinds Option Values
INSERT INTO option_values (option_id, code, label, order_index, extra_data)
SELECT id, 'cordlock', 'Cordlock', 1, '{"price": 0, "pricing_method": "per-unit", "description": "Traditional cord and lock system"}'::jsonb
FROM treatment_options WHERE treatment_category = 'roman_blinds' AND key = 'lift_system'
ON CONFLICT DO NOTHING;

INSERT INTO option_values (option_id, code, label, order_index, extra_data)
SELECT id, 'chainlock', 'Chainlock', 2, '{"price": 15, "pricing_method": "per-unit", "description": "Chain operated with lock"}'::jsonb
FROM treatment_options WHERE treatment_category = 'roman_blinds' AND key = 'lift_system'
ON CONFLICT DO NOTHING;

INSERT INTO option_values (option_id, code, label, order_index, extra_data)
SELECT id, 'motorized', 'Motorized', 3, '{"price": 250, "pricing_method": "per-unit", "description": "Electric motorized operation"}'::jsonb
FROM treatment_options WHERE treatment_category = 'roman_blinds' AND key = 'lift_system'
ON CONFLICT DO NOTHING;

INSERT INTO option_values (option_id, code, label, order_index, extra_data)
SELECT id, 'flat', 'Flat Fold', 1, '{"price": 0, "pricing_method": "per-unit", "description": "Smooth flat folds"}'::jsonb
FROM treatment_options WHERE treatment_category = 'roman_blinds' AND key = 'fold_style'
ON CONFLICT DO NOTHING;

INSERT INTO option_values (option_id, code, label, order_index, extra_data)
SELECT id, 'hobbled', 'Hobbled', 2, '{"price": 35, "pricing_method": "per-unit", "description": "Classic cascading folds"}'::jsonb
FROM treatment_options WHERE treatment_category = 'roman_blinds' AND key = 'fold_style'
ON CONFLICT DO NOTHING;

INSERT INTO option_values (option_id, code, label, order_index, extra_data)
SELECT id, 'relaxed', 'Relaxed', 3, '{"price": 25, "pricing_method": "per-unit", "description": "Soft relaxed appearance"}'::jsonb
FROM treatment_options WHERE treatment_category = 'roman_blinds' AND key = 'fold_style'
ON CONFLICT DO NOTHING;

INSERT INTO option_values (option_id, code, label, order_index, extra_data)
SELECT id, 'unlined', 'Unlined', 1, '{"price": 0, "pricing_method": "per-unit", "description": "No lining"}'::jsonb
FROM treatment_options WHERE treatment_category = 'roman_blinds' AND key = 'lining'
ON CONFLICT DO NOTHING;

INSERT INTO option_values (option_id, code, label, order_index, extra_data)
SELECT id, 'standard', 'Standard Lining', 2, '{"price": 20, "pricing_method": "per-meter", "description": "Light filtering standard lining"}'::jsonb
FROM treatment_options WHERE treatment_category = 'roman_blinds' AND key = 'lining'
ON CONFLICT DO NOTHING;

INSERT INTO option_values (option_id, code, label, order_index, extra_data)
SELECT id, 'blockout', 'Blockout Lining', 3, '{"price": 30, "pricing_method": "per-meter", "description": "Complete light blockout"}'::jsonb
FROM treatment_options WHERE treatment_category = 'roman_blinds' AND key = 'lining'
ON CONFLICT DO NOTHING;

-- VENETIAN BLINDS OPTIONS
INSERT INTO treatment_options (treatment_category, key, label, input_type, required, visible, order_index, is_system_default)
VALUES 
  ('venetian_blinds', 'slat_width', 'Slat Width', 'select', true, true, 1, true),
  ('venetian_blinds', 'material', 'Material', 'select', true, true, 2, true),
  ('venetian_blinds', 'control_type', 'Control Type', 'select', false, true, 3, true)
ON CONFLICT DO NOTHING;

-- Venetian Blinds Option Values
INSERT INTO option_values (option_id, code, label, order_index, extra_data)
SELECT id, '25mm', '25mm Slats', 1, '{"price": 0, "pricing_method": "per-unit", "description": "Standard 25mm slats"}'::jsonb
FROM treatment_options WHERE treatment_category = 'venetian_blinds' AND key = 'slat_width'
ON CONFLICT DO NOTHING;

INSERT INTO option_values (option_id, code, label, order_index, extra_data)
SELECT id, '50mm', '50mm Slats', 2, '{"price": 15, "pricing_method": "per-unit", "description": "Wide 50mm slats"}'::jsonb
FROM treatment_options WHERE treatment_category = 'venetian_blinds' AND key = 'slat_width'
ON CONFLICT DO NOTHING;

INSERT INTO option_values (option_id, code, label, order_index, extra_data)
SELECT id, '63mm', '63mm Slats', 3, '{"price": 25, "pricing_method": "per-unit", "description": "Extra wide 63mm slats"}'::jsonb
FROM treatment_options WHERE treatment_category = 'venetian_blinds' AND key = 'slat_width'
ON CONFLICT DO NOTHING;

INSERT INTO option_values (option_id, code, label, order_index, extra_data)
SELECT id, 'aluminum', 'Aluminum', 1, '{"price": 0, "pricing_method": "per-unit", "description": "Durable aluminum slats"}'::jsonb
FROM treatment_options WHERE treatment_category = 'venetian_blinds' AND key = 'material'
ON CONFLICT DO NOTHING;

INSERT INTO option_values (option_id, code, label, order_index, extra_data)
SELECT id, 'wood', 'Real Wood', 2, '{"price": 80, "pricing_method": "per-unit", "description": "Natural timber slats"}'::jsonb
FROM treatment_options WHERE treatment_category = 'venetian_blinds' AND key = 'material'
ON CONFLICT DO NOTHING;

INSERT INTO option_values (option_id, code, label, order_index, extra_data)
SELECT id, 'faux_wood', 'Faux Wood', 3, '{"price": 40, "pricing_method": "per-unit", "description": "Wood-look PVC slats"}'::jsonb
FROM treatment_options WHERE treatment_category = 'venetian_blinds' AND key = 'material'
ON CONFLICT DO NOTHING;

INSERT INTO option_values (option_id, code, label, order_index, extra_data)
SELECT id, 'cord', 'Cord Control', 1, '{"price": 0, "pricing_method": "per-unit", "description": "Standard cord operation"}'::jsonb
FROM treatment_options WHERE treatment_category = 'venetian_blinds' AND key = 'control_type'
ON CONFLICT DO NOTHING;

INSERT INTO option_values (option_id, code, label, order_index, extra_data)
SELECT id, 'wand', 'Wand Control', 2, '{"price": 10, "pricing_method": "per-unit", "description": "Wand tilt and lift"}'::jsonb
FROM treatment_options WHERE treatment_category = 'venetian_blinds' AND key = 'control_type'
ON CONFLICT DO NOTHING;

INSERT INTO option_values (option_id, code, label, order_index, extra_data)
SELECT id, 'motorized', 'Motorized', 3, '{"price": 280, "pricing_method": "per-unit", "description": "Electric motorized control"}'::jsonb
FROM treatment_options WHERE treatment_category = 'venetian_blinds' AND key = 'control_type'
ON CONFLICT DO NOTHING;

-- VERTICAL BLINDS OPTIONS
INSERT INTO treatment_options (treatment_category, key, label, input_type, required, visible, order_index, is_system_default)
VALUES 
  ('vertical_blinds', 'louvre_width', 'Louvre Width', 'select', true, true, 1, true),
  ('vertical_blinds', 'material', 'Material', 'select', true, true, 2, true),
  ('vertical_blinds', 'control_type', 'Control Type', 'select', false, true, 3, true)
ON CONFLICT DO NOTHING;

-- Vertical Blinds Option Values
INSERT INTO option_values (option_id, code, label, order_index, extra_data)
SELECT id, '89mm', '89mm Louvres', 1, '{"price": 0, "pricing_method": "per-unit", "description": "Standard 89mm width"}'::jsonb
FROM treatment_options WHERE treatment_category = 'vertical_blinds' AND key = 'louvre_width'
ON CONFLICT DO NOTHING;

INSERT INTO option_values (option_id, code, label, order_index, extra_data)
SELECT id, '127mm', '127mm Louvres', 2, '{"price": 15, "pricing_method": "per-unit", "description": "Wide 127mm louvres"}'::jsonb
FROM treatment_options WHERE treatment_category = 'vertical_blinds' AND key = 'louvre_width'
ON CONFLICT DO NOTHING;

INSERT INTO option_values (option_id, code, label, order_index, extra_data)
SELECT id, 'fabric', 'Fabric', 1, '{"price": 0, "pricing_method": "per-unit", "description": "Fabric louvres"}'::jsonb
FROM treatment_options WHERE treatment_category = 'vertical_blinds' AND key = 'material'
ON CONFLICT DO NOTHING;

INSERT INTO option_values (option_id, code, label, order_index, extra_data)
SELECT id, 'pvc', 'PVC', 2, '{"price": 10, "pricing_method": "per-unit", "description": "Durable PVC louvres"}'::jsonb
FROM treatment_options WHERE treatment_category = 'vertical_blinds' AND key = 'material'
ON CONFLICT DO NOTHING;

INSERT INTO option_values (option_id, code, label, order_index, extra_data)
SELECT id, 'aluminum', 'Aluminum', 3, '{"price": 25, "pricing_method": "per-unit", "description": "Metal aluminum louvres"}'::jsonb
FROM treatment_options WHERE treatment_category = 'vertical_blinds' AND key = 'material'
ON CONFLICT DO NOTHING;

INSERT INTO option_values (option_id, code, label, order_index, extra_data)
SELECT id, 'cord', 'Cord Control', 1, '{"price": 0, "pricing_method": "per-unit", "description": "Standard cord operation"}'::jsonb
FROM treatment_options WHERE treatment_category = 'vertical_blinds' AND key = 'control_type'
ON CONFLICT DO NOTHING;

INSERT INTO option_values (option_id, code, label, order_index, extra_data)
SELECT id, 'wand', 'Wand Control', 2, '{"price": 10, "pricing_method": "per-unit", "description": "Wand operation"}'::jsonb
FROM treatment_options WHERE treatment_category = 'vertical_blinds' AND key = 'control_type'
ON CONFLICT DO NOTHING;

INSERT INTO option_values (option_id, code, label, order_index, extra_data)
SELECT id, 'motorized', 'Motorized', 3, '{"price": 300, "pricing_method": "per-unit", "description": "Electric motorized control"}'::jsonb
FROM treatment_options WHERE treatment_category = 'vertical_blinds' AND key = 'control_type'
ON CONFLICT DO NOTHING;

-- SHUTTERS OPTIONS
INSERT INTO treatment_options (treatment_category, key, label, input_type, required, visible, order_index, is_system_default)
VALUES 
  ('shutters', 'material', 'Material', 'select', true, true, 1, true),
  ('shutters', 'louvre_size', 'Louvre Size', 'select', true, true, 2, true),
  ('shutters', 'frame_type', 'Frame Type', 'select', false, true, 3, true)
ON CONFLICT DO NOTHING;

-- Shutters Option Values
INSERT INTO option_values (option_id, code, label, order_index, extra_data)
SELECT id, 'basswood', 'Basswood', 1, '{"price": 0, "pricing_method": "per-meter", "description": "Premium basswood material"}'::jsonb
FROM treatment_options WHERE treatment_category = 'shutters' AND key = 'material'
ON CONFLICT DO NOTHING;

INSERT INTO option_values (option_id, code, label, order_index, extra_data)
SELECT id, 'pvc', 'PVC', 2, '{"price": -50, "pricing_method": "per-meter", "description": "Waterproof PVC shutters"}'::jsonb
FROM treatment_options WHERE treatment_category = 'shutters' AND key = 'material'
ON CONFLICT DO NOTHING;

INSERT INTO option_values (option_id, code, label, order_index, extra_data)
SELECT id, 'aluminum', 'Aluminum', 3, '{"price": 80, "pricing_method": "per-meter", "description": "Durable aluminum shutters"}'::jsonb
FROM treatment_options WHERE treatment_category = 'shutters' AND key = 'material'
ON CONFLICT DO NOTHING;

INSERT INTO option_values (option_id, code, label, order_index, extra_data)
SELECT id, '63mm', '63mm Louvres', 1, '{"price": 0, "pricing_method": "per-unit", "description": "Standard 63mm louvres"}'::jsonb
FROM treatment_options WHERE treatment_category = 'shutters' AND key = 'louvre_size'
ON CONFLICT DO NOTHING;

INSERT INTO option_values (option_id, code, label, order_index, extra_data)
SELECT id, '89mm', '89mm Louvres', 2, '{"price": 30, "pricing_method": "per-unit", "description": "Medium 89mm louvres"}'::jsonb
FROM treatment_options WHERE treatment_category = 'shutters' AND key = 'louvre_size'
ON CONFLICT DO NOTHING;

INSERT INTO option_values (option_id, code, label, order_index, extra_data)
SELECT id, '114mm', '114mm Louvres', 3, '{"price": 60, "pricing_method": "per-unit", "description": "Large 114mm louvres"}'::jsonb
FROM treatment_options WHERE treatment_category = 'shutters' AND key = 'louvre_size'
ON CONFLICT DO NOTHING;

INSERT INTO option_values (option_id, code, label, order_index, extra_data)
SELECT id, 'full_height', 'Full Height', 1, '{"price": 0, "pricing_method": "per-unit", "description": "Full height shutters"}'::jsonb
FROM treatment_options WHERE treatment_category = 'shutters' AND key = 'frame_type'
ON CONFLICT DO NOTHING;

INSERT INTO option_values (option_id, code, label, order_index, extra_data)
SELECT id, 'cafe_style', 'Café Style', 2, '{"price": -20, "pricing_method": "per-unit", "description": "Lower half coverage"}'::jsonb
FROM treatment_options WHERE treatment_category = 'shutters' AND key = 'frame_type'
ON CONFLICT DO NOTHING;

INSERT INTO option_values (option_id, code, label, order_index, extra_data)
SELECT id, 'tier_on_tier', 'Tier-on-Tier', 3, '{"price": 40, "pricing_method": "per-unit", "description": "Top and bottom independent operation"}'::jsonb
FROM treatment_options WHERE treatment_category = 'shutters' AND key = 'frame_type'
ON CONFLICT DO NOTHING;
-- Migration 3: Create Option Categories + Rules + Template Links

-- 1. Insert Option Type Categories (for UI visibility in Settings)
INSERT INTO option_type_categories (user_id, treatment_category, type_key, type_label, active, sort_order, account_id)
VALUES
  ('32a92783-f482-4e3d-8ebf-c292200674e5', 'venetian_blinds', 'slat_width_gustin', 'Lamelių plotis', true, 1, '32a92783-f482-4e3d-8ebf-c292200674e5'),
  ('32a92783-f482-4e3d-8ebf-c292200674e5', 'venetian_blinds', 'mechanism_type_gustin', 'Mechanizmo tipas', true, 2, '32a92783-f482-4e3d-8ebf-c292200674e5'),
  ('32a92783-f482-4e3d-8ebf-c292200674e5', 'venetian_blinds', 'finish_type_gustin', 'Apdailos tipas', true, 3, '32a92783-f482-4e3d-8ebf-c292200674e5'),
  ('32a92783-f482-4e3d-8ebf-c292200674e5', 'venetian_blinds', 'cord_type_gustin', 'Virvelių tipas', true, 4, '32a92783-f482-4e3d-8ebf-c292200674e5'),
  ('32a92783-f482-4e3d-8ebf-c292200674e5', 'venetian_blinds', 'cord_tips_gustin', 'Varpelių tipas', true, 5, '32a92783-f482-4e3d-8ebf-c292200674e5');

-- 2. Insert Option Rules (conditional logic)
-- Template ID: 3c4d1b0f-c621-43ec-af72-c93644254fbd

-- Rule 1: Filter mechanism types for 25mm slats (hide Somfy, tilt_only)
INSERT INTO option_rules (template_id, condition, effect, description, active)
VALUES (
  '3c4d1b0f-c621-43ec-af72-c93644254fbd',
  '{"option_key": "slat_width_gustin", "operator": "in_list", "value": ["25_iso", "25_timberlux"]}',
  '{"action": "filter_values", "target_option_key": "mechanism_type_gustin", "target_value": ["80b70ad2-500e-43af-a7b3-43d98df0f6ab", "376b4fa8-59c1-4dd5-ae39-410b37810095", "4fcb0e55-b1ba-43b7-9103-1501585d13f3", "8d5ecaec-e115-450f-80ac-926263505ff5", "dbabc38a-5e6d-4194-a339-bcff120f3622", "08949b33-e7aa-44b7-880a-9de71df51287"]}',
  'Slėpti Somfy ir tilt_only mechanizmus 25mm lamelėms',
  true
);

-- Rule 2: Filter cord types for 25mm slats (hide 38mm tape)
INSERT INTO option_rules (template_id, condition, effect, description, active)
VALUES (
  '3c4d1b0f-c621-43ec-af72-c93644254fbd',
  '{"option_key": "slat_width_gustin", "operator": "in_list", "value": ["25_iso", "25_timberlux"]}',
  '{"action": "filter_values", "target_option_key": "cord_type_gustin", "target_value": ["c06190c9-462e-4324-9d6a-556d12ecd87d", "fa890757-f7fa-4b5f-be80-e51978baaea2", "3ff520b2-5183-4953-abfa-7d7696ed0e91"]}',
  'Slėpti 38mm juostines virveles 25mm lamelėms',
  true
);

-- 3. Insert Template Option Settings (link options to template)
INSERT INTO template_option_settings (template_id, treatment_option_id, is_enabled, order_index)
VALUES
  ('3c4d1b0f-c621-43ec-af72-c93644254fbd', 'c72f6d5e-1369-4e15-be1c-f7bd3bfe55cc', true, 1),
  ('3c4d1b0f-c621-43ec-af72-c93644254fbd', 'bcdbbb33-9f00-4ebc-8ad8-ed03560e6c38', true, 2),
  ('3c4d1b0f-c621-43ec-af72-c93644254fbd', '1de29699-a98d-4fd0-91ab-164b4d261089', true, 3),
  ('3c4d1b0f-c621-43ec-af72-c93644254fbd', '119aed18-80f2-4dd2-9dea-5dab94db5420', true, 4),
  ('3c4d1b0f-c621-43ec-af72-c93644254fbd', '02343fc1-a7aa-4c92-9b8f-e62fd30e1dd3', true, 5);
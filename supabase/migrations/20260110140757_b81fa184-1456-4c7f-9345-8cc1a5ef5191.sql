-- Insert Option Rules for Conditional Hardware Display (Curtains template - Homekaara)
-- Template ID: ac3cfd19-05d2-4641-8d54-43a95b3b6eb7

INSERT INTO option_rules (id, template_id, condition, effect, description)
VALUES 
  -- Rule 1: Show Track Selection when Hardware Type = Track
  (gen_random_uuid(), 'ac3cfd19-05d2-4641-8d54-43a95b3b6eb7',
   '{"option_key": "hardware_type", "operator": "equals", "value": "track"}'::jsonb,
   '{"action": "show_option", "target_option_key": "track_selection"}'::jsonb,
   'Show track selection options when hardware type is Track'),
   
  -- Rule 2: Show Rod Selection when Hardware Type = Rod
  (gen_random_uuid(), 'ac3cfd19-05d2-4641-8d54-43a95b3b6eb7',
   '{"option_key": "hardware_type", "operator": "equals", "value": "rod"}'::jsonb,
   '{"action": "show_option", "target_option_key": "rod_selection"}'::jsonb,
   'Show rod selection options when hardware type is Rod'),
   
  -- Rule 3: Default to Rod for Eyelet heading
  (gen_random_uuid(), 'ac3cfd19-05d2-4641-8d54-43a95b3b6eb7',
   '{"option_key": "heading", "operator": "equals", "value": "eyelet"}'::jsonb,
   '{"action": "set_default", "target_option_key": "hardware_type", "target_value": "rod"}'::jsonb,
   'Default hardware type to Rod when Eyelet heading is selected'),
   
  -- Rule 4: Default to Track for Pleated Hook heading
  (gen_random_uuid(), 'ac3cfd19-05d2-4641-8d54-43a95b3b6eb7',
   '{"option_key": "heading", "operator": "equals", "value": "pleated_hook"}'::jsonb,
   '{"action": "set_default", "target_option_key": "hardware_type", "target_value": "track"}'::jsonb,
   'Default hardware type to Track when Pleated Hook heading is selected'),
   
  -- Rule 5: Default to Track for Wave heading
  (gen_random_uuid(), 'ac3cfd19-05d2-4641-8d54-43a95b3b6eb7',
   '{"option_key": "heading", "operator": "equals", "value": "wave"}'::jsonb,
   '{"action": "set_default", "target_option_key": "hardware_type", "target_value": "track"}'::jsonb,
   'Default hardware type to Track when Wave heading is selected'),
   
  -- Rule 6: Default to Track for European heading
  (gen_random_uuid(), 'ac3cfd19-05d2-4641-8d54-43a95b3b6eb7',
   '{"option_key": "heading", "operator": "equals", "value": "european"}'::jsonb,
   '{"action": "set_default", "target_option_key": "hardware_type", "target_value": "track"}'::jsonb,
   'Default hardware type to Track when European heading is selected'),
   
  -- Rule 7: Hide track_selection by default (only show when hardware_type = track)
  (gen_random_uuid(), 'ac3cfd19-05d2-4641-8d54-43a95b3b6eb7',
   '{"option_key": "hardware_type", "operator": "not_equals", "value": "track"}'::jsonb,
   '{"action": "hide_option", "target_option_key": "track_selection"}'::jsonb,
   'Hide track selection when hardware type is not Track'),
   
  -- Rule 8: Hide rod_selection by default (only show when hardware_type = rod)
  (gen_random_uuid(), 'ac3cfd19-05d2-4641-8d54-43a95b3b6eb7',
   '{"option_key": "hardware_type", "operator": "not_equals", "value": "rod"}'::jsonb,
   '{"action": "hide_option", "target_option_key": "rod_selection"}'::jsonb,
   'Hide rod selection when hardware type is not Rod')
ON CONFLICT DO NOTHING;
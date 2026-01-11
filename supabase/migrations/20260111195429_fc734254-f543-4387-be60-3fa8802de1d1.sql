-- Create visibility rules: show rod accessories only when hardware_type = Rod
-- Template ID: ac3cfd19-05d2-4641-8d54-43a95b3b6eb7 (Curtains)
-- Rod value ID: bf7cb9ae-3208-4d6a-b941-91d9c467c1db

-- Rule for Rings - visible when hardware_type = Rod
INSERT INTO option_rules (template_id, condition, effect, description, active) VALUES (
  'ac3cfd19-05d2-4641-8d54-43a95b3b6eb7',
  '{"operator": "equals", "option_key": "hardware_type", "value": "bf7cb9ae-3208-4d6a-b941-91d9c467c1db"}',
  '{"action": "show_option", "target_option_key": "rings"}',
  'Show curtain rings option when hardware type is Rod',
  true
);

-- Rule for Finials - visible when hardware_type = Rod
INSERT INTO option_rules (template_id, condition, effect, description, active) VALUES (
  'ac3cfd19-05d2-4641-8d54-43a95b3b6eb7',
  '{"operator": "equals", "option_key": "hardware_type", "value": "bf7cb9ae-3208-4d6a-b941-91d9c467c1db"}',
  '{"action": "show_option", "target_option_key": "finials"}',
  'Show finials option when hardware type is Rod',
  true
);

-- Rule for Rod End Caps - visible when hardware_type = Rod
INSERT INTO option_rules (template_id, condition, effect, description, active) VALUES (
  'ac3cfd19-05d2-4641-8d54-43a95b3b6eb7',
  '{"operator": "equals", "option_key": "hardware_type", "value": "bf7cb9ae-3208-4d6a-b941-91d9c467c1db"}',
  '{"action": "show_option", "target_option_key": "rod_end_caps"}',
  'Show rod end caps option when hardware type is Rod',
  true
);

-- Rule for Rod Brackets - visible when hardware_type = Rod
INSERT INTO option_rules (template_id, condition, effect, description, active) VALUES (
  'ac3cfd19-05d2-4641-8d54-43a95b3b6eb7',
  '{"operator": "equals", "option_key": "hardware_type", "value": "bf7cb9ae-3208-4d6a-b941-91d9c467c1db"}',
  '{"action": "show_option", "target_option_key": "rod_brackets"}',
  'Show rod brackets option when hardware type is Rod',
  true
);
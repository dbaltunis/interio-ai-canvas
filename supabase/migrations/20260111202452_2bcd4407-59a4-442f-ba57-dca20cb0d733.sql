-- Add visibility rules for Roller Blinds based on control_type
-- Chain control: show chain_side, roller_chain_length
-- Motorised control: show roller_motor_type

-- Get Roller/Zebra control_type option value IDs
-- Chain: 1e501a91-03a6-482f-af02-e28fc43723a8
-- Motorised: 815ba13a-26a5-423f-b0d4-462e7dd8bd64

-- Rules for Roller Blinds template
INSERT INTO option_rules (template_id, condition, effect, description, active)
VALUES 
  -- Show chain_side when Chain is selected
  ('65336f71-d16c-464b-8266-34bb797b5d69'::uuid,
   '{"option_key": "control_type", "operator": "equals", "value": "1e501a91-03a6-482f-af02-e28fc43723a8"}'::jsonb,
   '{"action": "show_option", "target_option_key": "chain_side"}'::jsonb,
   'Show chain side when Chain control selected', true),
  
  -- Show roller_chain_length when Chain is selected
  ('65336f71-d16c-464b-8266-34bb797b5d69'::uuid,
   '{"option_key": "control_type", "operator": "equals", "value": "1e501a91-03a6-482f-af02-e28fc43723a8"}'::jsonb,
   '{"action": "show_option", "target_option_key": "roller_chain_length"}'::jsonb,
   'Show chain length when Chain control selected', true),
  
  -- Show roller_motor_type when Motorised is selected
  ('65336f71-d16c-464b-8266-34bb797b5d69'::uuid,
   '{"option_key": "control_type", "operator": "equals", "value": "815ba13a-26a5-423f-b0d4-462e7dd8bd64"}'::jsonb,
   '{"action": "show_option", "target_option_key": "roller_motor_type"}'::jsonb,
   'Show motor type when Motorised control selected', true),

-- Rules for Zebra/Dual Blinds template (same rules)
  -- Show chain_side when Chain is selected
  ('fe9d007c-46ec-4960-adfd-6f3038d63c1c'::uuid,
   '{"option_key": "control_type", "operator": "equals", "value": "1e501a91-03a6-482f-af02-e28fc43723a8"}'::jsonb,
   '{"action": "show_option", "target_option_key": "chain_side"}'::jsonb,
   'Show chain side when Chain control selected', true),
  
  -- Show roller_chain_length when Chain is selected
  ('fe9d007c-46ec-4960-adfd-6f3038d63c1c'::uuid,
   '{"option_key": "control_type", "operator": "equals", "value": "1e501a91-03a6-482f-af02-e28fc43723a8"}'::jsonb,
   '{"action": "show_option", "target_option_key": "roller_chain_length"}'::jsonb,
   'Show chain length when Chain control selected', true),
  
  -- Show roller_motor_type when Motorised is selected
  ('fe9d007c-46ec-4960-adfd-6f3038d63c1c'::uuid,
   '{"option_key": "control_type", "operator": "equals", "value": "815ba13a-26a5-423f-b0d4-462e7dd8bd64"}'::jsonb,
   '{"action": "show_option", "target_option_key": "roller_motor_type"}'::jsonb,
   'Show motor type when Motorised control selected', true);
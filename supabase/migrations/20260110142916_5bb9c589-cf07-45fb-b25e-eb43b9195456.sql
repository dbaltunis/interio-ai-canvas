-- Fix option_rules to use option value IDs instead of string codes
-- Hardware type values:
-- Track = 8faed36c-5c41-4838-9d32-e0d1a9d4f300
-- Rod = bf7cb9ae-3208-4d6a-b941-91d9c467c1db

-- Update Rule 1: Show Track Selection when Hardware Type = Track (UUID)
UPDATE option_rules 
SET condition = '{"option_key": "hardware_type", "operator": "equals", "value": "8faed36c-5c41-4838-9d32-e0d1a9d4f300"}'::jsonb
WHERE template_id = 'ac3cfd19-05d2-4641-8d54-43a95b3b6eb7' 
AND effect->>'target_option_key' = 'track_selection'
AND effect->>'action' = 'show_option';

-- Update Rule 2: Show Rod Selection when Hardware Type = Rod (UUID)  
UPDATE option_rules 
SET condition = '{"option_key": "hardware_type", "operator": "equals", "value": "bf7cb9ae-3208-4d6a-b941-91d9c467c1db"}'::jsonb
WHERE template_id = 'ac3cfd19-05d2-4641-8d54-43a95b3b6eb7'
AND effect->>'target_option_key' = 'rod_selection'
AND effect->>'action' = 'show_option';

-- Update hide rules to use UUIDs
UPDATE option_rules 
SET condition = '{"option_key": "hardware_type", "operator": "not_equals", "value": "8faed36c-5c41-4838-9d32-e0d1a9d4f300"}'::jsonb
WHERE template_id = 'ac3cfd19-05d2-4641-8d54-43a95b3b6eb7'
AND effect->>'target_option_key' = 'track_selection'
AND effect->>'action' = 'hide_option';

UPDATE option_rules 
SET condition = '{"option_key": "hardware_type", "operator": "not_equals", "value": "bf7cb9ae-3208-4d6a-b941-91d9c467c1db"}'::jsonb
WHERE template_id = 'ac3cfd19-05d2-4641-8d54-43a95b3b6eb7'
AND effect->>'target_option_key' = 'rod_selection'
AND effect->>'action' = 'hide_option';

-- Update set_default rules to use UUIDs for target_value
UPDATE option_rules 
SET effect = '{"action": "set_default", "target_option_key": "hardware_type", "target_value": "bf7cb9ae-3208-4d6a-b941-91d9c467c1db"}'::jsonb
WHERE template_id = 'ac3cfd19-05d2-4641-8d54-43a95b3b6eb7'
AND effect->>'target_value' = 'rod';

UPDATE option_rules 
SET effect = '{"action": "set_default", "target_option_key": "hardware_type", "target_value": "8faed36c-5c41-4838-9d32-e0d1a9d4f300"}'::jsonb
WHERE template_id = 'ac3cfd19-05d2-4641-8d54-43a95b3b6eb7'
AND effect->>'target_value' = 'track';
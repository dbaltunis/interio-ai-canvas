-- Fix target_option_key casing: change 'Headrail' to 'headrail' to match treatment_options.key
UPDATE option_rules 
SET effect = jsonb_set(effect, '{target_option_key}', '"headrail"')
WHERE template_id = '844faed0-092f-4528-b5fc-4a17d37fddfa' 
  AND effect->>'action' = 'filter_values'
  AND effect->>'target_option_key' = 'Headrail';
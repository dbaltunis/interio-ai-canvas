-- Visibility rules for Roman Blinds
-- Template ID: 844faed0-092f-4528-b5fc-4a17d37fddfa

-- Show chain_length when control_system = White Ball Chain
INSERT INTO option_rules (template_id, condition, effect, description, active) VALUES
('844faed0-092f-4528-b5fc-4a17d37fddfa', '{"operator": "equals", "option_key": "control_system", "value": "0a801236-d57d-44f0-9f47-9c73ee4be072"}', '{"action": "show_option", "target_option_key": "chain_length"}', 'Show chain length when White Ball Chain selected', true),
('844faed0-092f-4528-b5fc-4a17d37fddfa', '{"operator": "equals", "option_key": "control_system", "value": "4ea2b812-f1b8-4a52-8e30-13c72548a39d"}', '{"action": "show_option", "target_option_key": "steel_chain_length"}', 'Show steel chain length when Steel Ball Chain selected', true),
('844faed0-092f-4528-b5fc-4a17d37fddfa', '{"operator": "equals", "option_key": "control_system", "value": "9330a423-45e6-4f05-a8e4-ba5ae063341d"}', '{"action": "show_option", "target_option_key": "motor_type"}', 'Show motor type when Motorised selected', true),
('844faed0-092f-4528-b5fc-4a17d37fddfa', '{"operator": "equals", "option_key": "control_system", "value": "9330a423-45e6-4f05-a8e4-ba5ae063341d"}', '{"action": "show_option", "target_option_key": "remote_type"}', 'Show remote type when Motorised selected', true);
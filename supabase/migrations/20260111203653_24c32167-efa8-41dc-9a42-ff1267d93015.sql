-- Add value filtering rules for Roman Blinds headrail based on control_system
-- Template: 844faed0-092f-4528-b5fc-4a17d37fddfa (Roman Blinds)

-- Control System values:
-- White Ball Chain: 0a801236-d57d-44f0-9f47-9c73ee4be072
-- Steel Ball Chain: 4ea2b812-f1b8-4a52-8e30-13c72548a39d
-- Twin System: 4a531133-f80e-4e80-a956-6691dc8af11e
-- Motorised: 9330a423-45e6-4f05-a8e4-ba5ae063341d

-- Headrail values (for Roman Blinds template):
-- White Chain Headrail: e5149542-7575-4e97-8dd9-b2ddc8ad0504
-- Steel Chain Headrail: 72002109-d2cf-4d04-b473-c43765a5e511
-- Twin Headrail: c4fb046b-e077-4ee2-b330-e650cc0b0a15
-- Motorised Headrail: b879048d-25a4-4793-8887-a02a389ba953

-- Rule 1: When White Ball Chain selected, filter headrail to only White Chain Headrail
INSERT INTO option_rules (template_id, condition, effect, description, active) VALUES (
  '844faed0-092f-4528-b5fc-4a17d37fddfa'::uuid,
  '{"option_key": "control_system", "operator": "equals", "value": "0a801236-d57d-44f0-9f47-9c73ee4be072"}'::jsonb,
  '{"action": "filter_values", "target_option_key": "Headrail", "target_value": ["e5149542-7575-4e97-8dd9-b2ddc8ad0504"]}'::jsonb,
  'When White Ball Chain selected, only show White Chain Headrail',
  true
);

-- Rule 2: When Steel Ball Chain selected, filter headrail to only Steel Chain Headrail
INSERT INTO option_rules (template_id, condition, effect, description, active) VALUES (
  '844faed0-092f-4528-b5fc-4a17d37fddfa'::uuid,
  '{"option_key": "control_system", "operator": "equals", "value": "4ea2b812-f1b8-4a52-8e30-13c72548a39d"}'::jsonb,
  '{"action": "filter_values", "target_option_key": "Headrail", "target_value": ["72002109-d2cf-4d04-b473-c43765a5e511"]}'::jsonb,
  'When Steel Ball Chain selected, only show Steel Chain Headrail',
  true
);

-- Rule 3: When Twin System selected, filter headrail to only Twin Headrail
INSERT INTO option_rules (template_id, condition, effect, description, active) VALUES (
  '844faed0-092f-4528-b5fc-4a17d37fddfa'::uuid,
  '{"option_key": "control_system", "operator": "equals", "value": "4a531133-f80e-4e80-a956-6691dc8af11e"}'::jsonb,
  '{"action": "filter_values", "target_option_key": "Headrail", "target_value": ["c4fb046b-e077-4ee2-b330-e650cc0b0a15"]}'::jsonb,
  'When Twin System selected, only show Twin Headrail',
  true
);

-- Rule 4: When Motorised selected, filter headrail to only Motorised Headrail
INSERT INTO option_rules (template_id, condition, effect, description, active) VALUES (
  '844faed0-092f-4528-b5fc-4a17d37fddfa'::uuid,
  '{"option_key": "control_system", "operator": "equals", "value": "9330a423-45e6-4f05-a8e4-ba5ae063341d"}'::jsonb,
  '{"action": "filter_values", "target_option_key": "Headrail", "target_value": ["b879048d-25a4-4793-8887-a02a389ba953"]}'::jsonb,
  'When Motorised selected, only show Motorised Headrail',
  true
);
-- Fix Homekaara Curtain Rules: Update option_key and value to use correct UUIDs

-- Rule 1: Eyelet → Rod (change heading to selected_heading, use UUID)
UPDATE option_rules 
SET condition = jsonb_set(
  jsonb_set(condition, '{option_key}', '"selected_heading"'),
  '{value}', '"365210bd-8aae-4fc0-801f-0c02765c5e92"'
),
updated_at = now()
WHERE id = 'ee82fb0b-66d4-476f-b4f5-849f210f7ced';

-- Rule 2: Pleated → Track
UPDATE option_rules 
SET condition = jsonb_set(
  jsonb_set(condition, '{option_key}', '"selected_heading"'),
  '{value}', '"eae74c2f-b2b6-4c2f-9846-b83b1801d2b1"'
),
updated_at = now()
WHERE id = '35d23f10-59e8-4418-87b0-526ef24118b7';

-- Rule 3: Wave → Track
UPDATE option_rules 
SET condition = jsonb_set(
  jsonb_set(condition, '{option_key}', '"selected_heading"'),
  '{value}', '"293ff3e0-9e50-4867-9e9e-3182acfec238"'
),
updated_at = now()
WHERE id = 'e249d8f9-f438-441c-8ff6-682e1d5bef06';

-- Rule 4: European Pleat → Track
UPDATE option_rules 
SET condition = jsonb_set(
  jsonb_set(condition, '{option_key}', '"selected_heading"'),
  '{value}', '"cb41129a-f72a-4a80-b86c-10e7a2caaae7"'
),
updated_at = now()
WHERE id = '2ef7f3e8-ea8c-41ae-8218-9d1d1c99b0b6';
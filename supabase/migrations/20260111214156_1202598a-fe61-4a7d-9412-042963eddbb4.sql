
-- Fix Roller Blind Option Prices for Homekaara

-- Motor Type prices
UPDATE option_values SET extra_data = '{"price": 15000, "pricing_method": "fixed"}'::jsonb
WHERE id = '78b52c15-508b-47c2-8e49-b483ffd2025a';

UPDATE option_values SET extra_data = '{"price": 20000, "pricing_method": "fixed"}'::jsonb
WHERE id = 'cbf717b5-eb4f-4768-b3b8-bf0cc7f7e59f';

UPDATE option_values SET extra_data = '{"price": 25000, "pricing_method": "fixed"}'::jsonb
WHERE id = '2e748aa2-91ce-4821-90d7-80a98253b305';

-- Installation prices
UPDATE option_values SET extra_data = '{"price": 500, "pricing_method": "fixed"}'::jsonb
WHERE id = 'be0b2969-95d1-4c94-b587-60f13e088745';

UPDATE option_values SET extra_data = '{"price": 1500, "pricing_method": "fixed"}'::jsonb
WHERE id = 'ea5cef79-ca01-4cb2-b5ee-33331f69555a';

-- Chain Length prices
UPDATE option_values SET extra_data = '{"price": 0, "pricing_method": "fixed"}'::jsonb
WHERE id = '60e3665a-1aa7-4a39-8918-a61556032571';

UPDATE option_values SET extra_data = '{"price": 200, "pricing_method": "fixed"}'::jsonb
WHERE id = '8164cd18-84d1-44e3-a7c3-f1b56f78db34';

UPDATE option_values SET extra_data = '{"price": 400, "pricing_method": "fixed"}'::jsonb
WHERE id = '51ac9d28-5a20-4ef7-8c51-28f22c3a6c06';

-- Control Type prices
UPDATE option_values SET extra_data = '{"price": 0, "pricing_method": "fixed"}'::jsonb
WHERE id = '1e501a91-03a6-482f-af02-e28fc43723a8';

UPDATE option_values SET extra_data = '{"price": 800, "pricing_method": "fixed"}'::jsonb
WHERE id = '26ae33e2-e79a-4c27-9423-e49fd1938298';

UPDATE option_values SET extra_data = '{"price": 0, "pricing_method": "fixed"}'::jsonb
WHERE id = '815ba13a-26a5-423f-b0d4-462e7dd8bd64';

-- Bottom Bar prices
UPDATE option_values SET extra_data = '{"price": 0, "pricing_method": "fixed"}'::jsonb
WHERE id = '519de62a-ef8c-4ac5-bdcf-69a1851f1d61';

UPDATE option_values SET extra_data = '{"price": 300, "pricing_method": "fixed"}'::jsonb
WHERE id = '17ebc9a2-7d06-4bc4-a5d8-9f7456f61d3e';

UPDATE option_values SET extra_data = '{"price": 500, "pricing_method": "fixed"}'::jsonb
WHERE id = '007d17b7-b446-4515-afbf-f06738c1a5d8';

-- Included options (brackets, chain side, roll direction) - price: 0
UPDATE option_values SET extra_data = '{"price": 0, "pricing_method": "fixed"}'::jsonb
WHERE id IN (
  '690b1845-ce0f-40fb-97b2-51e31637fb48',
  'ed7c9141-8b83-4949-acda-3e5d878a137f',
  'a43a601a-9973-43ab-b468-5ad85e17f2f9',
  'a214490a-1fa8-4b53-a031-560ee010a5a2',
  '7c237d19-b394-4fd7-bb6c-ff8cb4348664',
  '53561115-ca02-48f6-857b-fce1523fe45d',
  '3cfb63ae-77ff-4e9b-a286-71c16f471c75'
);

-- RESTORE: Fix zeroed-out quotes by recalculating from workshop_items
-- This is a ONE-TIME data fix for quotes that were incorrectly zeroed

-- Quote 1: 953e5e04-e6d2-40b2-a136-5d71719b8155 -> should be 55954.67
UPDATE quotes SET 
  subtotal = 55954.67,
  total_amount = 55954.67,
  updated_at = NOW()
WHERE id = '953e5e04-e6d2-40b2-a136-5d71719b8155' AND total_amount = 0;

-- Quote 2: 5982c9eb-b60d-4eb9-bbc1-5e5fca2736d6 -> should be 39846.00
UPDATE quotes SET 
  subtotal = 39846.00,
  total_amount = 39846.00,
  updated_at = NOW()
WHERE id = '5982c9eb-b60d-4eb9-bbc1-5e5fca2736d6' AND total_amount = 0;

-- Quote 3: fbbcba35-3f8d-4ad7-a622-c659b6eaae33 -> should be 30154.00
UPDATE quotes SET 
  subtotal = 30154.00,
  total_amount = 30154.00,
  updated_at = NOW()
WHERE id = 'fbbcba35-3f8d-4ad7-a622-c659b6eaae33' AND total_amount = 0;

-- Quote 4: 2503aad8-6326-4e40-9438-810b0cab1d7d -> should be 2403.50
UPDATE quotes SET 
  subtotal = 2403.50,
  total_amount = 2403.50,
  updated_at = NOW()
WHERE id = '2503aad8-6326-4e40-9438-810b0cab1d7d' AND total_amount = 0;

-- Quote 5: 519eeb57-12dd-44d2-8d3c-d98873e07702 -> should be 2403.50
UPDATE quotes SET 
  subtotal = 2403.50,
  total_amount = 2403.50,
  updated_at = NOW()
WHERE id = '519eeb57-12dd-44d2-8d3c-d98873e07702' AND total_amount = 0;

-- Quote 6: 8e488084-df64-4247-b680-ca5efff9bc52 -> should be 2403.50
UPDATE quotes SET 
  subtotal = 2403.50,
  total_amount = 2403.50,
  updated_at = NOW()
WHERE id = '8e488084-df64-4247-b680-ca5efff9bc52' AND total_amount = 0;

-- Quote 7: f3a80d95-6507-4819-8b08-203431a4b313 -> should be 1269.35
UPDATE quotes SET 
  subtotal = 1269.35,
  total_amount = 1269.35,
  updated_at = NOW()
WHERE id = 'f3a80d95-6507-4819-8b08-203431a4b313' AND total_amount = 0;

-- Quote 8: 6cc6166b-5a2b-4bbc-ac27-ac05ef2b6b63 -> should be 480.06
UPDATE quotes SET 
  subtotal = 480.06,
  total_amount = 480.06,
  updated_at = NOW()
WHERE id = '6cc6166b-5a2b-4bbc-ac27-ac05ef2b6b63' AND total_amount = 0;
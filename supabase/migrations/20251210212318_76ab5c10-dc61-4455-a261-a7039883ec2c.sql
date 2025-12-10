-- Fix existing accounts with incomplete or incorrect business_settings
-- Ensure all accounts have proper defaults including MM as internal unit standard

-- 1. Fix accounts with missing business_settings entirely
INSERT INTO public.business_settings (user_id, measurement_units, tax_rate, tax_type, pricing_settings, created_at, updated_at)
SELECT 
  up.user_id,
  '{"system":"metric","length":"mm","area":"sq_m","fabric":"m","currency":"USD"}',
  0,
  'none',
  '{"tax_inclusive": false, "default_markup_percentage": 50}',
  now(),
  now()
FROM user_profiles up
LEFT JOIN business_settings bs ON up.user_id = bs.user_id
WHERE up.parent_account_id IS NULL 
  AND up.role = 'Owner'
  AND bs.id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- 2. Fix accounts with NULL measurement_units
UPDATE business_settings
SET measurement_units = '{"system":"metric","length":"mm","area":"sq_m","fabric":"m","currency":"USD"}'
WHERE measurement_units IS NULL;

-- 3. Fix accounts with NULL tax_rate or tax_type
UPDATE business_settings
SET 
  tax_rate = COALESCE(tax_rate, 0),
  tax_type = COALESCE(tax_type, 'none'),
  updated_at = now()
WHERE tax_rate IS NULL OR tax_type IS NULL;

-- 4. Fix accounts with NULL pricing_settings
UPDATE business_settings
SET 
  pricing_settings = '{"tax_inclusive": false, "default_markup_percentage": 50}'::jsonb,
  updated_at = now()
WHERE pricing_settings IS NULL;

-- 5. Create missing number sequences for account owners
INSERT INTO public.number_sequences (user_id, entity_type, prefix, next_number, padding, active, created_at, updated_at)
SELECT 
  up.user_id,
  entity.entity_type,
  entity.prefix,
  1,
  3,
  true,
  now(),
  now()
FROM user_profiles up
CROSS JOIN (
  VALUES 
    ('draft', 'DRAFT-'),
    ('quote', 'QUOTE-'),
    ('order', 'ORDER-'),
    ('invoice', 'INV-'),
    ('job', 'JOB-')
) AS entity(entity_type, prefix)
WHERE up.parent_account_id IS NULL 
  AND up.role = 'Owner'
  AND NOT EXISTS (
    SELECT 1 FROM number_sequences ns 
    WHERE ns.user_id = up.user_id 
    AND ns.entity_type = entity.entity_type
  )
ON CONFLICT DO NOTHING;
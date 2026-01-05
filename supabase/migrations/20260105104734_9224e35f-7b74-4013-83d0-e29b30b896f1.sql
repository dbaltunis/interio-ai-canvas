-- Fix missing user_profiles entry for the test account
INSERT INTO user_profiles (
  user_id,
  display_name,
  first_name,
  last_name,
  role,
  account_type,
  parent_account_id,
  is_active,
  created_at,
  updated_at
) VALUES (
  'bddabdfa-685b-493e-b1ed-0462f739bdb2',
  'InterioApp Free Trial',
  'InterioApp',
  'Free Trial',
  'Owner',
  'test',
  NULL,
  true,
  now(),
  now()
)
ON CONFLICT (user_id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  role = EXCLUDED.role,
  account_type = EXCLUDED.account_type,
  is_active = true,
  updated_at = now();
-- Update already fixed bugs to resolved status
UPDATE bug_reports 
SET status = 'resolved', updated_at = now()
WHERE id IN (
  '17205a2d-4140-4513-b118-4f138c76d4fe',  -- mm used as cm
  '8860330b-bffb-4782-9c60-75aa0462b814'   -- 10mm width and drop
);

-- Seed window_types for accounts that don't have any
INSERT INTO window_types (id, name, key, visual_key, org_id)
SELECT 
  gen_random_uuid(),
  wt.name,
  wt.key,
  wt.visual_key,
  owner_accounts.owner_id as org_id
FROM (
  SELECT DISTINCT COALESCE(up.parent_account_id, up.user_id) as owner_id
  FROM user_profiles up
  WHERE up.parent_account_id IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM window_types wt 
    WHERE wt.org_id = COALESCE(up.parent_account_id, up.user_id)
  )
) owner_accounts
CROSS JOIN (
  VALUES 
    ('Standard Window', 'standard', 'standard'),
    ('Bay Window', 'bay', 'bay')
) AS wt(name, key, visual_key);
-- Clean up duplicate treatment_options and properly link TWC options
-- Step 1: Delete old generic options that are duplicates of TWC options (keep TWC ones with more values)

-- First, identify the TWC options (they have keys like 'control_type', 'control_length', 'fixing', etc. with many values)
-- For venetian_blinds, keep options with more option_values and delete the old generic ones

-- Delete duplicate treatment_options that have fewer values (keeping the TWC ones)
WITH twc_options AS (
  SELECT DISTINCT ON (account_id, treatment_category, key) 
    id,
    account_id,
    treatment_category,
    key,
    (SELECT COUNT(*) FROM option_values ov WHERE ov.option_id = to2.id) as value_count
  FROM treatment_options to2
  WHERE account_id = 'b0c727dd-b9bf-4470-840d-1f630e8f2b26'
    AND treatment_category = 'venetian_blinds'
  ORDER BY account_id, treatment_category, key, 
    (SELECT COUNT(*) FROM option_values ov WHERE ov.option_id = to2.id) DESC
),
duplicates_to_delete AS (
  SELECT to2.id
  FROM treatment_options to2
  JOIN twc_options tw ON tw.account_id = to2.account_id 
    AND tw.treatment_category = to2.treatment_category 
    AND tw.key = to2.key
  WHERE to2.id != tw.id  -- Not the "keeper" (TWC option with most values)
    AND to2.account_id = 'b0c727dd-b9bf-4470-840d-1f630e8f2b26'
    AND to2.treatment_category = 'venetian_blinds'
)
-- First delete related option_values
DELETE FROM option_values WHERE option_id IN (SELECT id FROM duplicates_to_delete);

-- Now delete the duplicate treatment_options
WITH twc_options AS (
  SELECT DISTINCT ON (account_id, treatment_category, key) 
    id,
    account_id,
    treatment_category,
    key
  FROM treatment_options to2
  WHERE account_id = 'b0c727dd-b9bf-4470-840d-1f630e8f2b26'
    AND treatment_category = 'venetian_blinds'
  ORDER BY account_id, treatment_category, key, 
    (SELECT COUNT(*) FROM option_values ov WHERE ov.option_id = to2.id) DESC
)
DELETE FROM treatment_options to2
USING twc_options tw
WHERE tw.account_id = to2.account_id 
  AND tw.treatment_category = to2.treatment_category 
  AND tw.key = to2.key
  AND to2.id != tw.id
  AND to2.account_id = 'b0c727dd-b9bf-4470-840d-1f630e8f2b26'
  AND to2.treatment_category = 'venetian_blinds';

-- Step 2: Delete orphaned template_option_settings that point to now-deleted options
DELETE FROM template_option_settings 
WHERE template_id = 'a6b6ed6c-e62a-42b7-8283-ae63941e0fec'
  AND treatment_option_id NOT IN (SELECT id FROM treatment_options);

-- Step 3: Link ALL remaining venetian_blinds options for this account to the template with is_enabled=true
INSERT INTO template_option_settings (template_id, treatment_option_id, is_enabled)
SELECT 
  'a6b6ed6c-e62a-42b7-8283-ae63941e0fec',
  to2.id,
  true
FROM treatment_options to2
WHERE to2.account_id = 'b0c727dd-b9bf-4470-840d-1f630e8f2b26'
  AND to2.treatment_category = 'venetian_blinds'
  AND NOT EXISTS (
    SELECT 1 FROM template_option_settings tos 
    WHERE tos.template_id = 'a6b6ed6c-e62a-42b7-8283-ae63941e0fec'
      AND tos.treatment_option_id = to2.id
  )
ON CONFLICT DO NOTHING;

-- Step 4: Update any existing disabled settings to enabled
UPDATE template_option_settings 
SET is_enabled = true
WHERE template_id = 'a6b6ed6c-e62a-42b7-8283-ae63941e0fec';
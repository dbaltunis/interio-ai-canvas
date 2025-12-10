-- Step 1: Delete template_option_settings for orphaned options (options without matching option_type_categories)
DELETE FROM template_option_settings 
WHERE treatment_option_id IN (
  SELECT to_opt.id FROM treatment_options to_opt
  WHERE NOT EXISTS (
    SELECT 1 FROM option_type_categories otc 
    WHERE otc.account_id = to_opt.account_id 
      AND otc.type_key = to_opt.key 
      AND otc.treatment_category = to_opt.treatment_category
  )
  AND to_opt.template_id IS NULL
);

-- Step 2: Delete orphaned treatment_options (no matching option_type_categories entry)
DELETE FROM treatment_options 
WHERE id IN (
  SELECT to_opt.id FROM treatment_options to_opt
  WHERE NOT EXISTS (
    SELECT 1 FROM option_type_categories otc 
    WHERE otc.account_id = to_opt.account_id 
      AND otc.type_key = to_opt.key 
      AND otc.treatment_category = to_opt.treatment_category
  )
  AND to_opt.template_id IS NULL
);

-- Step 3: Create missing template_option_settings for ALL existing templates and their category's options
INSERT INTO template_option_settings (template_id, treatment_option_id, is_enabled)
SELECT DISTINCT ct.id, to_opt.id, true
FROM curtain_templates ct
INNER JOIN treatment_options to_opt 
  ON to_opt.account_id = ct.user_id 
  AND to_opt.treatment_category = ct.treatment_category
  AND to_opt.template_id IS NULL
WHERE ct.active = true
  AND NOT EXISTS (
    SELECT 1 FROM template_option_settings tos 
    WHERE tos.template_id = ct.id 
      AND tos.treatment_option_id = to_opt.id
  );
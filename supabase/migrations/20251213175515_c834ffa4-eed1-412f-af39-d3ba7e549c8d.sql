-- Phase 1: Re-create ALL TWC Options Under User's Account
-- Step 2: Copy option_values to newly created options (with account_id)
INSERT INTO option_values (option_id, code, label, order_index, account_id)
SELECT 
  new_opt.id,
  ov.code,
  ov.label,
  ov.order_index,
  'ec930f73-ef23-4430-921f-1b401859825d' as account_id
FROM option_values ov
JOIN treatment_options old_opt ON ov.option_id = old_opt.id
JOIN treatment_options new_opt ON 
  new_opt.key = old_opt.key 
  AND new_opt.treatment_category = old_opt.treatment_category
  AND new_opt.account_id = 'ec930f73-ef23-4430-921f-1b401859825d'
  AND new_opt.source = 'twc'
WHERE old_opt.source = 'twc'
  AND old_opt.account_id != 'ec930f73-ef23-4430-921f-1b401859825d'
  AND NOT EXISTS (
    SELECT 1 FROM option_values existing
    WHERE existing.option_id = new_opt.id
    AND existing.code = ov.code
  );

-- Step 3: Link new TWC options to the TWC template via template_option_settings
INSERT INTO template_option_settings (template_id, treatment_option_id, is_enabled)
SELECT DISTINCT
  tos.template_id,
  new_opt.id,
  true
FROM template_option_settings tos
JOIN treatment_options old_opt ON tos.treatment_option_id = old_opt.id
JOIN treatment_options new_opt ON 
  new_opt.key = old_opt.key 
  AND new_opt.treatment_category = old_opt.treatment_category
  AND new_opt.account_id = 'ec930f73-ef23-4430-921f-1b401859825d'
  AND new_opt.source = 'twc'
WHERE old_opt.source = 'twc'
  AND old_opt.account_id != 'ec930f73-ef23-4430-921f-1b401859825d'
  AND NOT EXISTS (
    SELECT 1 FROM template_option_settings existing
    WHERE existing.template_id = tos.template_id
    AND existing.treatment_option_id = new_opt.id
  );
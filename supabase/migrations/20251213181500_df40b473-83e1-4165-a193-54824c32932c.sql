
-- =====================================================
-- PHASE 1: Re-create TWC options under correct account
-- =====================================================

-- Step 1: Create new TWC options under the correct account
INSERT INTO treatment_options (
  account_id,
  treatment_category,
  key,
  label,
  input_type,
  order_index,
  visible,
  required,
  source,
  pricing_method,
  base_price
)
SELECT DISTINCT ON (to_orig.treatment_category, to_orig.key)
  'ec930f73-ef23-4430-921f-1b401859825d' as account_id,
  to_orig.treatment_category,
  to_orig.key,
  to_orig.label,
  to_orig.input_type,
  to_orig.order_index,
  true as visible,
  COALESCE(to_orig.required, false) as required,
  'twc' as source,
  to_orig.pricing_method,
  to_orig.base_price
FROM treatment_options to_orig
WHERE to_orig.source = 'twc'
  AND to_orig.account_id != 'ec930f73-ef23-4430-921f-1b401859825d'
  AND NOT EXISTS (
    SELECT 1 FROM treatment_options existing
    WHERE existing.account_id = 'ec930f73-ef23-4430-921f-1b401859825d'
    AND existing.key = to_orig.key
    AND existing.treatment_category = to_orig.treatment_category
  )
ORDER BY to_orig.treatment_category, to_orig.key, to_orig.created_at DESC;

-- Step 2: Copy option_values from old TWC options to new ones
INSERT INTO option_values (option_id, code, label, order_index, pricing_method, account_id)
SELECT 
  new_opt.id,
  ov.code,
  ov.label,
  ov.order_index,
  ov.pricing_method,
  'ec930f73-ef23-4430-921f-1b401859825d'
FROM option_values ov
JOIN treatment_options old_opt ON ov.option_id = old_opt.id
JOIN treatment_options new_opt ON 
  new_opt.key = old_opt.key 
  AND new_opt.treatment_category = old_opt.treatment_category
  AND new_opt.account_id = 'ec930f73-ef23-4430-921f-1b401859825d'
WHERE old_opt.source = 'twc'
  AND old_opt.account_id != 'ec930f73-ef23-4430-921f-1b401859825d'
  AND NOT EXISTS (
    SELECT 1 FROM option_values existing_ov
    WHERE existing_ov.option_id = new_opt.id
    AND existing_ov.code = ov.code
  );

-- Step 3: Link new TWC options to TWC templates via template_option_settings
INSERT INTO template_option_settings (template_id, treatment_option_id, is_enabled)
SELECT DISTINCT
  ct.id as template_id,
  to_new.id as treatment_option_id,
  true as is_enabled
FROM curtain_templates ct
JOIN treatment_options to_new ON 
  to_new.treatment_category = ct.treatment_category
  AND to_new.account_id = 'ec930f73-ef23-4430-921f-1b401859825d'
  AND to_new.source = 'twc'
WHERE ct.user_id = 'ec930f73-ef23-4430-921f-1b401859825d'
  AND ct.active = true
  AND ct.name ILIKE '%TWC%'
  AND NOT EXISTS (
    SELECT 1 FROM template_option_settings existing_tos
    WHERE existing_tos.template_id = ct.id
    AND existing_tos.treatment_option_id = to_new.id
  );

-- =====================================================
-- PHASE 2: Create template_grid_assignments table
-- =====================================================

CREATE TABLE IF NOT EXISTS template_grid_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES curtain_templates(id) ON DELETE CASCADE,
  pricing_grid_id UUID NOT NULL REFERENCES pricing_grids(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(template_id, pricing_grid_id)
);

ALTER TABLE template_grid_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own template grid assignments"
ON template_grid_assignments
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM curtain_templates ct
    WHERE ct.id = template_grid_assignments.template_id
    AND (ct.user_id = auth.uid() OR public.is_same_account(ct.user_id))
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM curtain_templates ct
    WHERE ct.id = template_grid_assignments.template_id
    AND (ct.user_id = auth.uid() OR public.is_same_account(ct.user_id))
  )
);

CREATE INDEX IF NOT EXISTS idx_template_grid_assignments_template 
ON template_grid_assignments(template_id);

CREATE INDEX IF NOT EXISTS idx_template_grid_assignments_grid 
ON template_grid_assignments(pricing_grid_id);

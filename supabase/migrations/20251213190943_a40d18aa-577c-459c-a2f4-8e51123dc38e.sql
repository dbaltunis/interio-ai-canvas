
-- PHASE 1: Delete ALL fake TWC options and their values from user's account

-- First delete option_values for TWC options
DELETE FROM option_values
WHERE option_id IN (
  SELECT id FROM treatment_options 
  WHERE account_id = 'ec930f73-ef23-4430-921f-1b401859825d'
  AND source = 'twc'
);

-- Delete template_option_settings for TWC options
DELETE FROM template_option_settings
WHERE treatment_option_id IN (
  SELECT id FROM treatment_options 
  WHERE account_id = 'ec930f73-ef23-4430-921f-1b401859825d'
  AND source = 'twc'
);

-- Delete the fake TWC treatment_options themselves
DELETE FROM treatment_options
WHERE account_id = 'ec930f73-ef23-4430-921f-1b401859825d'
AND source = 'twc';

-- Clean up any cross-account linkages that may exist
-- Delete template_option_settings where template owner doesn't match option owner
DELETE FROM template_option_settings tos
WHERE EXISTS (
  SELECT 1 FROM curtain_templates ct
  JOIN treatment_options to_opt ON to_opt.id = tos.treatment_option_id
  WHERE ct.id = tos.template_id
  AND to_opt.account_id != ct.user_id
);

-- PHASE 3: Add RLS policy for template_option_settings to prevent cross-account linkages
DROP POLICY IF EXISTS "template_option_settings_select_policy" ON template_option_settings;
DROP POLICY IF EXISTS "template_option_settings_insert_policy" ON template_option_settings;
DROP POLICY IF EXISTS "template_option_settings_update_policy" ON template_option_settings;
DROP POLICY IF EXISTS "template_option_settings_delete_policy" ON template_option_settings;
DROP POLICY IF EXISTS "Users can view their own template option settings" ON template_option_settings;
DROP POLICY IF EXISTS "Users can insert their own template option settings" ON template_option_settings;
DROP POLICY IF EXISTS "Users can update their own template option settings" ON template_option_settings;
DROP POLICY IF EXISTS "Users can delete their own template option settings" ON template_option_settings;

-- Create new policies that validate both template AND option belong to same account
CREATE POLICY "template_option_settings_account_select"
ON template_option_settings FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM curtain_templates ct
    WHERE ct.id = template_option_settings.template_id
    AND (ct.user_id = auth.uid() OR public.is_same_account(ct.user_id))
  )
);

CREATE POLICY "template_option_settings_account_insert"
ON template_option_settings FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM curtain_templates ct
    JOIN treatment_options topt ON topt.id = template_option_settings.treatment_option_id
    WHERE ct.id = template_option_settings.template_id
    AND (ct.user_id = auth.uid() OR public.is_same_account(ct.user_id))
    AND topt.account_id = ct.user_id
  )
);

CREATE POLICY "template_option_settings_account_update"
ON template_option_settings FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM curtain_templates ct
    WHERE ct.id = template_option_settings.template_id
    AND (ct.user_id = auth.uid() OR public.is_same_account(ct.user_id))
  )
);

CREATE POLICY "template_option_settings_account_delete"
ON template_option_settings FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM curtain_templates ct
    WHERE ct.id = template_option_settings.template_id
    AND (ct.user_id = auth.uid() OR public.is_same_account(ct.user_id))
  )
);

-- PHASE 1: Clean up cross-account linkages and fake options
-- Delete ALL template_option_settings that link options from different accounts than template owner

-- Step 1: Find and delete cross-account linkages in template_option_settings
DELETE FROM public.template_option_settings
WHERE id IN (
  SELECT tos.id 
  FROM public.template_option_settings tos
  JOIN public.treatment_options topt ON tos.treatment_option_id = topt.id
  JOIN public.curtain_templates ct ON tos.template_id = ct.id
  WHERE topt.account_id != ct.user_id  -- Option's account doesn't match template's owner
);

-- Step 2: Delete fake "Admin test" options that were incorrectly copied between accounts
-- These are test options that should only exist in their creator's account
DELETE FROM public.option_values
WHERE option_id IN (
  SELECT id FROM public.treatment_options 
  WHERE key LIKE '%admin_test%'
    OR key LIKE '%test_%'
    OR label ILIKE '%admin test%'
);

DELETE FROM public.treatment_options
WHERE key LIKE '%admin_test%'
  OR key LIKE '%test_%'
  OR label ILIKE '%admin test%';

-- PHASE 3: Add RLS policy to prevent future cross-account linkages
-- First drop any existing policies on template_option_settings
DROP POLICY IF EXISTS "Users can view template option settings" ON public.template_option_settings;
DROP POLICY IF EXISTS "Users can manage template option settings" ON public.template_option_settings;
DROP POLICY IF EXISTS "template_option_settings_select" ON public.template_option_settings;
DROP POLICY IF EXISTS "template_option_settings_insert" ON public.template_option_settings;
DROP POLICY IF EXISTS "template_option_settings_update" ON public.template_option_settings;
DROP POLICY IF EXISTS "template_option_settings_delete" ON public.template_option_settings;

-- Enable RLS on template_option_settings if not already enabled
ALTER TABLE public.template_option_settings ENABLE ROW LEVEL SECURITY;

-- Create secure RLS policies that verify BOTH template AND option belong to same account
-- SELECT: User can view settings where template belongs to their account
CREATE POLICY "template_option_settings_select"
ON public.template_option_settings
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.curtain_templates ct
    WHERE ct.id = template_id
    AND (ct.user_id = auth.uid() OR public.is_same_account(ct.user_id))
  )
);

-- INSERT: User can only create settings linking their own templates to their own options
CREATE POLICY "template_option_settings_insert"
ON public.template_option_settings
FOR INSERT
WITH CHECK (
  -- Template must belong to user's account
  EXISTS (
    SELECT 1 FROM public.curtain_templates ct
    WHERE ct.id = template_id
    AND (ct.user_id = auth.uid() OR public.is_same_account(ct.user_id))
  )
  AND
  -- Option must belong to user's account
  EXISTS (
    SELECT 1 FROM public.treatment_options topt
    WHERE topt.id = treatment_option_id
    AND (topt.account_id = auth.uid() OR public.is_same_account(topt.account_id))
  )
);

-- UPDATE: User can update settings for their templates
CREATE POLICY "template_option_settings_update"
ON public.template_option_settings
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.curtain_templates ct
    WHERE ct.id = template_id
    AND (ct.user_id = auth.uid() OR public.is_same_account(ct.user_id))
  )
);

-- DELETE: User can delete settings for their templates
CREATE POLICY "template_option_settings_delete"
ON public.template_option_settings
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.curtain_templates ct
    WHERE ct.id = template_id
    AND (ct.user_id = auth.uid() OR public.is_same_account(ct.user_id))
  )
);
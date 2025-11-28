-- Complete Template Cloning migration: Drop ALL dependent policies, then columns

-- Step 1: Drop ALL RLS policies that reference is_system_default

-- Policies on option_type_categories
DROP POLICY IF EXISTS "Users can view system defaults and account categories" ON option_type_categories;
DROP POLICY IF EXISTS "Users can update their account categories" ON option_type_categories;
DROP POLICY IF EXISTS "Users can delete their account categories" ON option_type_categories;

-- Policies on curtain_templates
DROP POLICY IF EXISTS "Users can view system defaults and account templates" ON curtain_templates;
DROP POLICY IF EXISTS "Users can update their account templates" ON curtain_templates;
DROP POLICY IF EXISTS "Users can delete their account templates" ON curtain_templates;
DROP POLICY IF EXISTS "Allow viewing system default templates" ON curtain_templates;

-- Policies on option_rules that reference curtain_templates.is_system_default
DROP POLICY IF EXISTS "Users can view option rules for their templates" ON option_rules;

-- Step 2: Drop is_system_default columns
ALTER TABLE option_type_categories DROP COLUMN IF EXISTS is_system_default;
ALTER TABLE curtain_templates DROP COLUMN IF EXISTS is_system_default;

-- Step 3: Recreate RLS policies WITHOUT is_system_default references

-- Policies for option_type_categories
CREATE POLICY "Users can view their account categories"
ON option_type_categories FOR SELECT
USING (account_id = public.get_user_account_id(auth.uid()));

CREATE POLICY "Users can insert their account categories"
ON option_type_categories FOR INSERT
WITH CHECK (account_id = public.get_user_account_id(auth.uid()));

CREATE POLICY "Users can update their account categories"
ON option_type_categories FOR UPDATE
USING (account_id = public.get_user_account_id(auth.uid()));

CREATE POLICY "Users can delete their account categories"
ON option_type_categories FOR DELETE
USING (account_id = public.get_user_account_id(auth.uid()));

-- Policies for curtain_templates (simplified, account-scoped only)
CREATE POLICY "Users can view their account templates"
ON curtain_templates FOR SELECT
USING (user_id = public.get_user_account_id(auth.uid()));

CREATE POLICY "Users can insert their account templates"
ON curtain_templates FOR INSERT
WITH CHECK (user_id = public.get_user_account_id(auth.uid()));

CREATE POLICY "Users can update their account templates"
ON curtain_templates FOR UPDATE
USING (user_id = public.get_user_account_id(auth.uid()));

CREATE POLICY "Users can delete their account templates"
ON curtain_templates FOR DELETE
USING (user_id = public.get_user_account_id(auth.uid()));

-- Policies for option_rules (simplified)
CREATE POLICY "Users can view option rules for their templates"
ON option_rules FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM curtain_templates ct
    WHERE ct.id = option_rules.template_id
    AND ct.user_id = public.get_user_account_id(auth.uid())
  )
);

-- Step 4: Force PostgREST schema cache refresh multiple times
NOTIFY pgrst, 'reload schema';

ALTER TABLE option_type_categories ADD COLUMN _refresh_temp BOOLEAN;
ALTER TABLE option_type_categories DROP COLUMN _refresh_temp;

ALTER TABLE curtain_templates ADD COLUMN _refresh_temp BOOLEAN;  
ALTER TABLE curtain_templates DROP COLUMN _refresh_temp;

NOTIFY pgrst, 'reload schema';
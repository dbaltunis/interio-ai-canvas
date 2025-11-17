-- Fix system default templates visibility

-- Add policy to allow all authenticated users to view system default templates
CREATE POLICY "Allow viewing system default templates" ON public.curtain_templates
  FOR SELECT
  USING (
    is_system_default = true 
    OR get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id)
  );

-- Drop the old restrictive SELECT policy
DROP POLICY IF EXISTS "Account isolation - SELECT" ON public.curtain_templates;

-- Activate all system default templates so they show up
UPDATE public.curtain_templates
SET active = true
WHERE is_system_default = true;
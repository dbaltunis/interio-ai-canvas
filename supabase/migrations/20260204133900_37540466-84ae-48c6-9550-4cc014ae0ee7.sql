-- Fix project_notes INSERT RLS policy for multi-tenant support
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can create their own project notes" ON public.project_notes;
DROP POLICY IF EXISTS "account_insert" ON public.project_notes;

-- Create unified insert policy that supports team members
CREATE POLICY "project_notes_insert" ON public.project_notes
FOR INSERT TO authenticated
WITH CHECK (
  user_id = public.get_effective_account_owner(auth.uid())
);
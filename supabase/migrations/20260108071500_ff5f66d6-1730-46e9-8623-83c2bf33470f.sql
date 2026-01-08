-- Fix the UPDATE policy - it was incorrectly restricted to a specific role
-- Need to recreate with proper TO authenticated clause

DROP POLICY IF EXISTS "Account isolation - UPDATE" ON public.user_profiles;

CREATE POLICY "Account isolation - UPDATE" 
ON public.user_profiles FOR UPDATE
USING (
  get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id) 
  OR public.is_admin()
)
WITH CHECK (
  get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id) 
  OR public.is_admin()
);
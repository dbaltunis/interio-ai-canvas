-- Fix user_profiles RLS policy to allow System Owners to block/update any account
-- Currently admins cannot update other user profiles due to account isolation

-- Drop the existing UPDATE policy
DROP POLICY IF EXISTS "Account isolation - UPDATE" ON public.user_profiles;

-- Create new UPDATE policy with admin override
CREATE POLICY "Account isolation - UPDATE" 
ON public.user_profiles FOR UPDATE
TO authenticated
USING (
  get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id) 
  OR public.is_admin()
)
WITH CHECK (
  get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id) 
  OR public.is_admin()
);
-- Drop the incorrect admin policies that allow cross-account access
DROP POLICY IF EXISTS "Admins can view all invitations" ON public.user_invitations;
DROP POLICY IF EXISTS "Admins can delete any invitation" ON public.user_invitations;

-- Create account-isolated admin policies
CREATE POLICY "Admins can view account invitations"
ON public.user_invitations
FOR SELECT
TO authenticated
USING (
  public.is_admin() AND 
  get_account_owner(auth.uid()) = get_account_owner(user_id)
);

CREATE POLICY "Admins can delete account invitations"
ON public.user_invitations
FOR DELETE
TO authenticated
USING (
  public.is_admin() AND 
  get_account_owner(auth.uid()) = get_account_owner(user_id)
);
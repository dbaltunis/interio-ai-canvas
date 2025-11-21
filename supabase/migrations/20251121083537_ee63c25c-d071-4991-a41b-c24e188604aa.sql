-- Add SELECT policy for admins to view ALL invitations (including orphaned ones)
CREATE POLICY "Admins can view all invitations"
ON public.user_invitations
FOR SELECT
TO authenticated
USING (
  public.is_admin()
);
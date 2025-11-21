-- Add DELETE policy so admins can remove any invitation
CREATE POLICY "Admins can delete any invitation"
ON public.user_invitations
FOR DELETE
TO authenticated
USING (
  public.is_admin()
);
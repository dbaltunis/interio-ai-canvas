-- Add System Owner SELECT policy to user_profiles
-- This allows the admin panel to view and update any account

CREATE POLICY "System owners can view all profiles"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.user_id = auth.uid()
    AND up.role = 'System Owner'
  )
);
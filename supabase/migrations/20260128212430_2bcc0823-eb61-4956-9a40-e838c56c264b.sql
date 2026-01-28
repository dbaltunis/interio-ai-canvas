-- Add System Owner INSERT policy to user_subscriptions
-- This allows admins to create subscriptions for any account

CREATE POLICY "System owners can insert subscriptions"
ON public.user_subscriptions
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_system_owner(auth.uid())
);
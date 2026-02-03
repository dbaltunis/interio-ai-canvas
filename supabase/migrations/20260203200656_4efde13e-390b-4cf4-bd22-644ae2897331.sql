-- Add INSERT policy for account_settings
-- Allows account owners to create their own settings, and System Owners to create for any account
CREATE POLICY "account_settings_insert_policy" ON public.account_settings
FOR INSERT
WITH CHECK (
  auth.uid() = account_owner_id
  OR public.is_system_owner(auth.uid())
);

-- Add UPDATE policy for account_settings
-- Allows account members to update their account's settings, and System Owners to update any
CREATE POLICY "account_settings_update_policy" ON public.account_settings
FOR UPDATE
USING (
  public.get_account_owner(auth.uid()) = account_owner_id
  OR public.is_system_owner(auth.uid())
)
WITH CHECK (
  public.get_account_owner(auth.uid()) = account_owner_id
  OR public.is_system_owner(auth.uid())
);

-- Add DELETE policy for account_settings (System Owner only for cleanup)
CREATE POLICY "account_settings_delete_policy" ON public.account_settings
FOR DELETE
USING (
  public.is_system_owner(auth.uid())
);
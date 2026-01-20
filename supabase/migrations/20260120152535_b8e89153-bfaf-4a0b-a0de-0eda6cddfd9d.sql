-- Fix client delete RLS policies - consolidate and ensure proper permission checking
-- Drop the redundant/conflicting delete policies
DROP POLICY IF EXISTS "Account isolation - DELETE" ON public.clients;
DROP POLICY IF EXISTS "account_delete" ON public.clients;
DROP POLICY IF EXISTS "Users can delete clients based on permissions" ON public.clients;

-- Create a single, clear delete policy that:
-- 1. Ensures user is in the same account
-- 2. Checks for delete_clients permission OR is the account owner
CREATE POLICY "clients_delete_policy" ON public.clients
FOR DELETE
USING (
  -- Must be in the same account
  public.get_effective_account_owner(auth.uid()) = public.get_effective_account_owner(user_id)
  AND (
    -- Account owner can always delete
    auth.uid() = public.get_effective_account_owner(user_id)
    OR
    -- Or has explicit delete permission
    'delete_clients' = ANY(public.get_user_effective_permissions(auth.uid()))
  )
);
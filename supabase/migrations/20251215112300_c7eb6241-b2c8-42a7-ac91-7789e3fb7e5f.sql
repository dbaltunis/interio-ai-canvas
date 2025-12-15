-- Drop existing policies (keeping only the account_select one)
DROP POLICY IF EXISTS "Users can view their own permissions" ON public.user_permissions;
DROP POLICY IF EXISTS "read user_permissions" ON public.user_permissions;

-- Create comprehensive RLS policies for user_permissions
-- Admins and owners can manage permissions for users in their account

-- SELECT: Users can see their own permissions, admins/owners can see all in their account
CREATE POLICY "user_permissions_select" ON public.user_permissions
FOR SELECT USING (
  auth.uid() = user_id 
  OR public.is_same_account(user_id)
);

-- INSERT: Only admins/owners can add permissions for users in their account
CREATE POLICY "user_permissions_insert" ON public.user_permissions
FOR INSERT WITH CHECK (
  public.is_same_account(user_id)
);

-- UPDATE: Only admins/owners can update permissions for users in their account
CREATE POLICY "user_permissions_update" ON public.user_permissions
FOR UPDATE USING (
  public.is_same_account(user_id)
);

-- DELETE: Only admins/owners can delete permissions for users in their account
CREATE POLICY "user_permissions_delete" ON public.user_permissions
FOR DELETE USING (
  public.is_same_account(user_id)
);
-- Fix RLS policies for user management
-- First, update user_profiles RLS to allow proper deletion and updates

-- Drop and recreate RLS policies for user_profiles
DROP POLICY IF EXISTS "Users can delete business settings" ON user_profiles;
DROP POLICY IF EXISTS "Users can update business settings" ON user_profiles;
DROP POLICY IF EXISTS "Users can view business settings" ON user_profiles;

-- Add proper user management policies
CREATE POLICY "Account owners can manage all users in their account" 
ON user_profiles 
FOR ALL
USING (
  get_account_owner(auth.uid()) = get_account_owner(user_id) 
  AND has_permission('manage_users')
);

CREATE POLICY "Users can view users in their account" 
ON user_profiles 
FOR SELECT
USING (
  get_account_owner(auth.uid()) = get_account_owner(user_id)
);

CREATE POLICY "Users can update their own profile" 
ON user_profiles 
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create function to handle cascading user deletion
CREATE OR REPLACE FUNCTION delete_user_cascade(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Check if current user has permission to delete users
  IF NOT has_permission('manage_users') THEN
    RAISE EXCEPTION 'Insufficient permissions to delete users';
  END IF;

  -- Prevent deleting account owner
  IF target_user_id = get_account_owner(target_user_id) THEN
    RAISE EXCEPTION 'Cannot delete account owner';
  END IF;

  -- Delete related records first
  DELETE FROM user_permissions WHERE user_id = target_user_id;
  DELETE FROM permission_audit_log WHERE target_user_id = target_user_id OR user_id = target_user_id;
  DELETE FROM user_invitations WHERE user_id = target_user_id;
  
  -- Mark any invitations sent to this user's email as expired
  UPDATE user_invitations 
  SET status = 'expired', updated_at = now()
  WHERE invited_email = (SELECT email FROM auth.users WHERE id = target_user_id)
    AND status = 'pending';
  
  -- Delete user profile
  DELETE FROM user_profiles WHERE user_id = target_user_id;
  
  -- Note: We don't delete from auth.users as that's managed by Supabase
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_user_cascade(uuid) TO authenticated;
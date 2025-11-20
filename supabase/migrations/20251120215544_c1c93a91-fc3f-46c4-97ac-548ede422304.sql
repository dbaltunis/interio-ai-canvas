-- Fix user_invitations RLS policies to avoid auth.users access issues

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view invitations they sent" ON user_invitations;
DROP POLICY IF EXISTS "Users can insert invitations" ON user_invitations;
DROP POLICY IF EXISTS "Users can view invitations sent to their email" ON user_invitations;
DROP POLICY IF EXISTS "Users can update their own invitations" ON user_invitations;
DROP POLICY IF EXISTS "Admins can create invitations" ON user_invitations;
DROP POLICY IF EXISTS "Users can view invitations for their email" ON user_invitations;
DROP POLICY IF EXISTS "Users can accept invitations sent to them" ON user_invitations;

-- Enable RLS
ALTER TABLE user_invitations ENABLE ROW LEVEL SECURITY;

-- Create security definer function to safely check if user owns an email
CREATE OR REPLACE FUNCTION public.user_owns_email(check_user_id uuid, check_email text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = check_user_id 
    AND email = check_email
  );
$$;

-- Policy 1: Users can view invitations they created
CREATE POLICY "Users can view invitations they sent"
ON user_invitations
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR user_id IN (
    SELECT user_id FROM user_profiles 
    WHERE parent_account_id = (SELECT get_account_owner(auth.uid()))
  )
);

-- Policy 2: Admins/Owners can create invitations
CREATE POLICY "Admins can create invitations"
ON user_invitations
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND is_admin_or_owner()
);

-- Policy 3: Users can view invitations sent to their email (for acceptance)
CREATE POLICY "Users can view invitations for their email"
ON user_invitations
FOR SELECT
TO authenticated
USING (
  user_owns_email(auth.uid(), invited_email)
);

-- Policy 4: Users can update invitations sent to them (for acceptance)
CREATE POLICY "Users can accept invitations sent to them"
ON user_invitations
FOR UPDATE
TO authenticated
USING (
  user_owns_email(auth.uid(), invited_email)
  AND status = 'pending'
)
WITH CHECK (
  status IN ('accepted', 'rejected')
);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON user_invitations TO authenticated;

-- Add helpful comments
COMMENT ON FUNCTION public.user_owns_email(uuid, text) IS 
  'Security definer function to safely check if a user ID matches an email without exposing auth.users';
COMMENT ON POLICY "Users can view invitations they sent" ON user_invitations IS 
  'Allows users to see invitations they created and their team members invitations';
COMMENT ON POLICY "Admins can create invitations" ON user_invitations IS 
  'Only admins and owners can create new invitations';
COMMENT ON POLICY "Users can view invitations for their email" ON user_invitations IS 
  'Allows users to see invitations sent to their email address';
COMMENT ON POLICY "Users can accept invitations sent to them" ON user_invitations IS 
  'Allows users to accept or reject invitations sent to their email';
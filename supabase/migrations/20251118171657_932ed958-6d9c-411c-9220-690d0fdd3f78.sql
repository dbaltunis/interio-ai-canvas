
-- ============================================
-- Add RLS policies for user_invitations table
-- ============================================

-- Enable RLS on user_invitations
ALTER TABLE user_invitations ENABLE ROW LEVEL SECURITY;

-- Allow users to view invitations they created (inviter) or received (invitee)
-- AND invitations from their account (team members can see team invitations)
CREATE POLICY "Users can view invitations for their account"
  ON user_invitations FOR SELECT
  USING (
    user_id = auth.uid() -- Inviter
    OR invited_email = (SELECT email FROM auth.users WHERE id = auth.uid()) -- Invitee
    OR user_id = get_user_account_id(auth.uid()) -- From same account
    OR user_id IN ( -- From team members in same account
      SELECT user_id 
      FROM user_profiles 
      WHERE parent_account_id = get_user_account_id(auth.uid())
        OR user_id = get_user_account_id(auth.uid())
    )
  );

-- Allow users to create invitations for their account
CREATE POLICY "Users can create invitations for their account"
  ON user_invitations FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Allow users to update invitations they created
CREATE POLICY "Users can update their own invitations"
  ON user_invitations FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Allow users to delete invitations they created
CREATE POLICY "Users can delete their own invitations"
  ON user_invitations FOR DELETE
  USING (user_id = auth.uid());

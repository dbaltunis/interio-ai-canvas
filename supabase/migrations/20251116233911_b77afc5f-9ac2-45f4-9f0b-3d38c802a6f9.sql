-- Fix Kuldeep's account to be a team member under the correct parent
-- Kuldeep accepted invitation but parent_account_id wasn't set

UPDATE user_profiles 
SET 
  parent_account_id = 'ec930f73-ef23-4430-921f-1b401859825d',
  role = 'Admin'  -- Keep Admin role as per invitation
WHERE user_id = '1e621bea-fe86-469b-bc1c-2e0003961ae8';

-- Fix any other accepted invitations that didn't set parent_account_id
-- This ensures all accepted team members are properly linked to their parent accounts

UPDATE user_profiles up
SET parent_account_id = (
  SELECT au.id 
  FROM auth.users au
  WHERE au.email = ui.invited_by_email
  LIMIT 1
)
FROM user_invitations ui
WHERE ui.invited_email = (
  SELECT email FROM auth.users WHERE id = up.user_id
)
AND ui.status = 'accepted'
AND up.parent_account_id IS NULL
AND up.role != 'Owner';

COMMENT ON COLUMN user_profiles.parent_account_id IS 'Links team members to their account owner. NULL for account owners, set for team members.';
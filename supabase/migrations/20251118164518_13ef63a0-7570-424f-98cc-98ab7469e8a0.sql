-- FIX 1: Remove overly permissive window_types RLS policy that causes data leak
-- This policy allowed ALL authenticated users to see ALL organizations' window types
DROP POLICY IF EXISTS "Authenticated users can view window types" ON public.window_types;

-- The existing organization-scoped policies are correct and will remain:
-- "Users can view their window types" - uses get_account_owner()
-- "Users can manage their window types" - uses get_account_owner()

-- Ensure parent_account_id is properly indexed for team member queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_parent_account_id 
ON user_profiles(parent_account_id);

-- Add comment for future developers
COMMENT ON TABLE window_types IS 'Window types are organization-scoped. Access controlled via get_account_owner() RLS policies.';
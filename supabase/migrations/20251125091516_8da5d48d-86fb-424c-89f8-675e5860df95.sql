-- Drop the overly permissive RLS policy that allows cross-account data leaks
DROP POLICY IF EXISTS "Admins can manage treatment options" ON treatment_options;

-- The remaining policies already provide proper account isolation:
-- "Users can view their account's treatment options" - uses get_user_account_id()
-- "Users can insert their account's treatment options" - uses get_user_account_id()
-- "Users can update their account's treatment options" - uses get_user_account_id()
-- "Users can delete their account's treatment options" - uses get_user_account_id()
-- Remove old conflicting RLS policies on option_type_categories
-- These conflict with the new account-based policies and cause inconsistent deletion behavior

-- Drop old user-based policies
DROP POLICY IF EXISTS "Users can create their own option types" ON option_type_categories;
DROP POLICY IF EXISTS "Users can view system and own option types" ON option_type_categories;
DROP POLICY IF EXISTS "Users can update their own option types" ON option_type_categories;
DROP POLICY IF EXISTS "Users can delete their own option types" ON option_type_categories;

-- The new account-based policies (created in previous migration) are:
-- - Account isolation - SELECT
-- - Account isolation - INSERT
-- - Account isolation - UPDATE  
-- - Account isolation - DELETE

-- These provide proper multi-tenant isolation using get_user_account_id()
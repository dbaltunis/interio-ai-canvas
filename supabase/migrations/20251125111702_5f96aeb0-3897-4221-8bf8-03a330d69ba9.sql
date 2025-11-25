
-- Fix RLS policies on option_type_categories to allow viewing system defaults

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view option type categories" ON option_type_categories;
DROP POLICY IF EXISTS "Users can manage their option type categories" ON option_type_categories;
DROP POLICY IF EXISTS "Users can insert option type categories" ON option_type_categories;
DROP POLICY IF EXISTS "Users can update option type categories" ON option_type_categories;
DROP POLICY IF EXISTS "Users can delete option type categories" ON option_type_categories;

-- SELECT: Users can view system defaults + their own account's categories
CREATE POLICY "Users can view system defaults and account categories"
ON option_type_categories
FOR SELECT
USING (
  is_system_default = true 
  OR account_id IS NULL 
  OR account_id = get_user_account_id(auth.uid())
);

-- INSERT: Users can create categories for their account
CREATE POLICY "Users can create categories for their account"
ON option_type_categories
FOR INSERT
WITH CHECK (
  account_id = get_user_account_id(auth.uid())
);

-- UPDATE: Users can only update their own account's categories (not system defaults)
CREATE POLICY "Users can update their account categories"
ON option_type_categories
FOR UPDATE
USING (
  is_system_default = false 
  AND account_id = get_user_account_id(auth.uid())
)
WITH CHECK (
  is_system_default = false 
  AND account_id = get_user_account_id(auth.uid())
);

-- DELETE: Users can only delete their own account's categories (not system defaults)
CREATE POLICY "Users can delete their account categories"
ON option_type_categories
FOR DELETE
USING (
  is_system_default = false 
  AND account_id = get_user_account_id(auth.uid())
);

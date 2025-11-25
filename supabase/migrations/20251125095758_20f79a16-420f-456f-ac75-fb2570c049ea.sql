-- Phase 1: Fix corrupted system defaults
-- These 14 treatment_options have both is_system_default = true AND account_id set
-- This is a data integrity issue - system defaults should NOT have account_id
-- We'll set is_system_default = false to make them account-specific options
UPDATE treatment_options
SET is_system_default = false
WHERE is_system_default = true 
  AND account_id IS NOT NULL;

-- Phase 2: Add account-based isolation to option_type_categories
-- Step 1: Add account_id column
ALTER TABLE option_type_categories 
ADD COLUMN IF NOT EXISTS account_id uuid;

-- Step 2: Migrate existing data - set account_id from user's account owner
UPDATE option_type_categories
SET account_id = get_account_owner(user_id)
WHERE user_id IS NOT NULL
  AND account_id IS NULL;

-- Step 3: For system defaults (user_id IS NULL), leave account_id as NULL
-- These are truly global defaults

-- Step 4: Drop old RLS policies
DROP POLICY IF EXISTS "Users can create their own option type categories" ON option_type_categories;
DROP POLICY IF EXISTS "Users can view active option type categories" ON option_type_categories;
DROP POLICY IF EXISTS "Users can manage their own option type categories" ON option_type_categories;
DROP POLICY IF EXISTS "Users can toggle option type visibility" ON option_type_categories;

-- Step 5: Create new account-based RLS policies
CREATE POLICY "Account isolation - SELECT"
ON option_type_categories
FOR SELECT
USING (
  -- System defaults (no account_id) are visible to all
  account_id IS NULL
  OR
  -- Account-specific categories visible to account members
  get_user_account_id(auth.uid()) = account_id
);

CREATE POLICY "Account isolation - INSERT"
ON option_type_categories
FOR INSERT
WITH CHECK (
  -- Must set account_id to user's account
  account_id = get_user_account_id(auth.uid())
);

CREATE POLICY "Account isolation - UPDATE"
ON option_type_categories
FOR UPDATE
USING (
  -- Can only update own account's categories
  account_id = get_user_account_id(auth.uid())
)
WITH CHECK (
  -- Cannot change account_id
  account_id = get_user_account_id(auth.uid())
);

CREATE POLICY "Account isolation - DELETE"
ON option_type_categories
FOR DELETE
USING (
  -- Can only delete own account's categories (not system defaults)
  account_id = get_user_account_id(auth.uid())
  AND account_id IS NOT NULL
);

-- Step 6: Create index for performance
CREATE INDEX IF NOT EXISTS idx_option_type_categories_account_id 
ON option_type_categories(account_id);
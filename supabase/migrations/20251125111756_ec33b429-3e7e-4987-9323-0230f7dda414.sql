
-- Add RLS policies for treatment_options table to ensure account isolation

-- Enable RLS
ALTER TABLE treatment_options ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view system defaults and account options" ON treatment_options;
DROP POLICY IF EXISTS "Users can create options for their account" ON treatment_options;
DROP POLICY IF EXISTS "Users can update their account options" ON treatment_options;
DROP POLICY IF EXISTS "Users can delete their account options" ON treatment_options;

-- SELECT: Users can view system defaults + their own account's options
CREATE POLICY "Users can view system defaults and account options"
ON treatment_options
FOR SELECT
USING (
  is_system_default = true 
  OR account_id IS NULL 
  OR account_id = get_user_account_id(auth.uid())
);

-- INSERT: Users can create options for their account
CREATE POLICY "Users can create options for their account"
ON treatment_options
FOR INSERT
WITH CHECK (
  account_id = get_user_account_id(auth.uid())
);

-- UPDATE: Users can only update their own account's options (not system defaults)
CREATE POLICY "Users can update their account options"
ON treatment_options
FOR UPDATE
USING (
  is_system_default = false 
  AND account_id = get_user_account_id(auth.uid())
)
WITH CHECK (
  is_system_default = false 
  AND account_id = get_user_account_id(auth.uid())
);

-- DELETE: Users can only delete their own account's options (not system defaults)
CREATE POLICY "Users can delete their account options"
ON treatment_options
FOR DELETE
USING (
  is_system_default = false 
  AND account_id = get_user_account_id(auth.uid())
);

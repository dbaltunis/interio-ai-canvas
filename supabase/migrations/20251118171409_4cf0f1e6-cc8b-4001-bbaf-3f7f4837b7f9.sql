
-- ============================================
-- CRITICAL FIX: Add account isolation to treatment_options and option_values
-- ============================================

-- Step 1: Add account_id column to treatment_options
ALTER TABLE treatment_options ADD COLUMN IF NOT EXISTS account_id UUID REFERENCES auth.users(id);

-- Step 2: Add account_id column to option_values
ALTER TABLE option_values ADD COLUMN IF NOT EXISTS account_id UUID;

-- Step 3: Create helper function to get user's account_id
CREATE OR REPLACE FUNCTION get_user_account_id(p_user_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_account_id UUID;
BEGIN
  -- Check if user is an account owner (parent_account_id IS NULL)
  -- If so, return their user_id
  -- If not, return their parent_account_id
  SELECT COALESCE(parent_account_id, user_id)
  INTO v_account_id
  FROM user_profiles
  WHERE user_id = p_user_id;
  
  RETURN v_account_id;
END;
$$;

-- Step 4: Populate account_id for existing records
-- For treatment_options, set account_id to the first account owner
UPDATE treatment_options
SET account_id = (
  SELECT user_id 
  FROM user_profiles 
  WHERE parent_account_id IS NULL 
  ORDER BY created_at 
  LIMIT 1
)
WHERE account_id IS NULL;

-- For option_values, get account_id from their parent treatment_option
UPDATE option_values ov
SET account_id = (
  SELECT to2.account_id
  FROM treatment_options to2
  WHERE to2.id = ov.option_id
)
WHERE ov.account_id IS NULL;

-- Step 5: Make account_id NOT NULL after population
ALTER TABLE treatment_options ALTER COLUMN account_id SET NOT NULL;
ALTER TABLE option_values ALTER COLUMN account_id SET NOT NULL;

-- Step 6: Enable RLS on both tables
ALTER TABLE treatment_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE option_values ENABLE ROW LEVEL SECURITY;

-- Step 7: Create RLS policies for treatment_options
CREATE POLICY "Users can view their account's treatment options"
  ON treatment_options FOR SELECT
  USING (account_id = get_user_account_id(auth.uid()));

CREATE POLICY "Users can insert treatment options for their account"
  ON treatment_options FOR INSERT
  WITH CHECK (account_id = get_user_account_id(auth.uid()));

CREATE POLICY "Users can update their account's treatment options"
  ON treatment_options FOR UPDATE
  USING (account_id = get_user_account_id(auth.uid()))
  WITH CHECK (account_id = get_user_account_id(auth.uid()));

CREATE POLICY "Users can delete their account's treatment options"
  ON treatment_options FOR DELETE
  USING (account_id = get_user_account_id(auth.uid()));

-- Step 8: Create RLS policies for option_values
CREATE POLICY "Users can view their account's option values"
  ON option_values FOR SELECT
  USING (account_id = get_user_account_id(auth.uid()));

CREATE POLICY "Users can insert option values for their account"
  ON option_values FOR INSERT
  WITH CHECK (account_id = get_user_account_id(auth.uid()));

CREATE POLICY "Users can update their account's option values"
  ON option_values FOR UPDATE
  USING (account_id = get_user_account_id(auth.uid()))
  WITH CHECK (account_id = get_user_account_id(auth.uid()));

CREATE POLICY "Users can delete their account's option values"
  ON option_values FOR DELETE
  USING (account_id = get_user_account_id(auth.uid()));

-- Step 9: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_treatment_options_account_id ON treatment_options(account_id);
CREATE INDEX IF NOT EXISTS idx_option_values_account_id ON option_values(account_id);

-- Step 10: Add foreign key constraint for option_values account_id
ALTER TABLE option_values 
  ADD CONSTRAINT fk_option_values_account_id 
  FOREIGN KEY (account_id) 
  REFERENCES auth.users(id);

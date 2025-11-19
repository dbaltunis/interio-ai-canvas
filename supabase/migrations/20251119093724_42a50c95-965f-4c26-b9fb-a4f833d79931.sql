-- ============================================
-- REMOVE LEAKY RLS POLICIES (keep account-scoped ones)
-- ============================================

-- Drop non-account-scoped policies for treatment_options
DROP POLICY IF EXISTS "Users can view treatment options" ON treatment_options;
DROP POLICY IF EXISTS "Users can create treatment options" ON treatment_options;
DROP POLICY IF EXISTS "Users can update treatment options" ON treatment_options;
DROP POLICY IF EXISTS "Users can delete treatment options" ON treatment_options;
DROP POLICY IF EXISTS "Users can insert treatment options for their account" ON treatment_options; -- Old name
DROP POLICY IF EXISTS "Admins can manage treatment_options" ON treatment_options;

-- Drop non-account-scoped policies for option_values  
DROP POLICY IF EXISTS "Users can view option values" ON option_values;
DROP POLICY IF EXISTS "Users can create option values" ON option_values;
DROP POLICY IF EXISTS "Users can update option values" ON option_values;
DROP POLICY IF EXISTS "Users can delete option values" ON option_values;
DROP POLICY IF EXISTS "Users can insert option values for their account" ON option_values; -- Old name
DROP POLICY IF EXISTS "Admins can manage option_values" ON option_values;

-- Verify only account-scoped policies remain:
-- treatment_options: "Users can view/insert/update/delete their account's treatment options"
-- option_values: "Users can view/insert/update/delete their account's option values"
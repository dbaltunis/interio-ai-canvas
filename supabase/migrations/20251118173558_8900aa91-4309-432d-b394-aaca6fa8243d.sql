-- ============================================
-- CRITICAL SECURITY FIX: Remove permissive RLS policies
-- Drop "Anyone can view" policies that leak data across accounts
-- ============================================

-- Drop permissive policy on treatment_options
DROP POLICY IF EXISTS "Anyone can view treatment options" ON treatment_options;

-- Drop permissive policy on option_values  
DROP POLICY IF EXISTS "Anyone can view option values" ON option_values;

-- The account-scoped policies created in migration 20251118164901 will now be the only active policies:
-- "Users can view their account's treatment options"
-- "Users can view their account's option values"
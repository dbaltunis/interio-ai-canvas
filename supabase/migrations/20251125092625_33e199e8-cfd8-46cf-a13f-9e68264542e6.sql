-- CRITICAL SECURITY FIX: Drop overly permissive RLS policy on option_values
-- This policy allows ANY admin/owner to see option_values from ALL accounts
-- Similar to the treatment_options fix, this bypasses account isolation

DROP POLICY IF EXISTS "Admins can manage option values" ON option_values;

-- The remaining policies properly isolate by account:
-- - "Users can view their account's option values" - uses get_user_account_id()
-- - "Users can insert/update/delete their account's option values" - uses get_user_account_id()

-- Verify RLS is enabled
ALTER TABLE option_values ENABLE ROW LEVEL SECURITY;
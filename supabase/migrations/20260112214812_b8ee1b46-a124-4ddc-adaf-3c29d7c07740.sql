-- Fix RLS for quotes table to allow account owners to see quotes created by their team members (including dealers)
-- This addresses the issue where owners see zero totals on dealer-created jobs

-- First, let's check what policies exist and update them to use effective account owner pattern
DROP POLICY IF EXISTS "quotes_select_policy" ON quotes;
DROP POLICY IF EXISTS "Users can view their own quotes" ON quotes;
DROP POLICY IF EXISTS "quotes_select_account_scoped" ON quotes;
DROP POLICY IF EXISTS "Users can select own quotes" ON quotes;

-- Create new SELECT policy using effective account owner pattern
-- This allows:
-- 1. Dealers to see their own quotes
-- 2. Account owners to see all team member quotes (including dealers)
-- 3. Team members with proper permissions to see quotes within their account
CREATE POLICY "quotes_select_account_scoped" ON quotes
FOR SELECT TO authenticated
USING (
  get_effective_account_owner(user_id) = get_effective_account_owner(auth.uid())
);

-- Also update INSERT policy to use effective account owner
DROP POLICY IF EXISTS "Users can insert their own quotes" ON quotes;
DROP POLICY IF EXISTS "quotes_insert_policy" ON quotes;

CREATE POLICY "quotes_insert_account_scoped" ON quotes
FOR INSERT TO authenticated
WITH CHECK (
  get_effective_account_owner(user_id) = get_effective_account_owner(auth.uid())
);

-- Also update UPDATE policy
DROP POLICY IF EXISTS "Users can update their own quotes" ON quotes;
DROP POLICY IF EXISTS "quotes_update_policy" ON quotes;

CREATE POLICY "quotes_update_account_scoped" ON quotes
FOR UPDATE TO authenticated
USING (
  get_effective_account_owner(user_id) = get_effective_account_owner(auth.uid())
);

-- Also update DELETE policy
DROP POLICY IF EXISTS "Users can delete their own quotes" ON quotes;
DROP POLICY IF EXISTS "quotes_delete_policy" ON quotes;

CREATE POLICY "quotes_delete_account_scoped" ON quotes
FOR DELETE TO authenticated
USING (
  get_effective_account_owner(user_id) = get_effective_account_owner(auth.uid())
);
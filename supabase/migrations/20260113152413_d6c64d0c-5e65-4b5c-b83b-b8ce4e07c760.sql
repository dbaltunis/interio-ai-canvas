-- =====================================================
-- FIX: Permission-Based RLS for Job-Related Tables
-- =====================================================

-- Step 1: Fix workshop_items RLS (statement timeout + permissions)
-- =====================================================

-- Drop ALL existing workshop_items policies
DROP POLICY IF EXISTS "Account scoped - workshop_items SELECT" ON workshop_items;
DROP POLICY IF EXISTS "Account scoped - workshop_items UPDATE" ON workshop_items;
DROP POLICY IF EXISTS "Account scoped - workshop_items DELETE" ON workshop_items;
DROP POLICY IF EXISTS "Permission-based workshop_items SELECT" ON workshop_items;
DROP POLICY IF EXISTS "Permission-based workshop_items UPDATE" ON workshop_items;
DROP POLICY IF EXISTS "Permission-based workshop_items DELETE" ON workshop_items;
DROP POLICY IF EXISTS "Account isolation - workshop_items SELECT" ON workshop_items;
DROP POLICY IF EXISTS "Account isolation - workshop_items UPDATE" ON workshop_items;
DROP POLICY IF EXISTS "Account isolation - workshop_items DELETE" ON workshop_items;

-- Create permission-aware SELECT policy (optimized)
CREATE POLICY "Permission-based workshop_items SELECT"
ON workshop_items FOR SELECT
USING (
  is_same_account(user_id)
  AND (
    get_user_role(auth.uid()) IN ('System Owner', 'Owner')
    OR is_admin()
    OR has_permission('view_all_jobs')
    OR auth.uid() = user_id
    OR (has_permission('view_assigned_jobs') AND project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    ))
  )
);

-- Create permission-aware UPDATE policy
CREATE POLICY "Permission-based workshop_items UPDATE"
ON workshop_items FOR UPDATE
USING (
  is_same_account(user_id)
  AND (
    get_user_role(auth.uid()) IN ('System Owner', 'Owner')
    OR is_admin()
    OR has_permission('edit_all_jobs')
    OR auth.uid() = user_id
    OR (has_permission('edit_assigned_jobs') AND project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    ))
  )
);

-- Create permission-aware DELETE policy
CREATE POLICY "Permission-based workshop_items DELETE"
ON workshop_items FOR DELETE
USING (
  is_same_account(user_id)
  AND (
    get_user_role(auth.uid()) IN ('System Owner', 'Owner')
    OR is_admin()
    OR has_permission('delete_jobs')
    OR auth.uid() = user_id
  )
);

-- Step 2: Fix quote_items RLS (account-scoped + permissions)
-- =====================================================

-- Drop existing quote_items policies
DROP POLICY IF EXISTS "Users can view quote items for their quotes" ON quote_items;
DROP POLICY IF EXISTS "Users can update quote items for their quotes" ON quote_items;
DROP POLICY IF EXISTS "Users can delete quote items for their quotes" ON quote_items;
DROP POLICY IF EXISTS "Users can insert quote items for their quotes" ON quote_items;
DROP POLICY IF EXISTS "Permission-based quote_items SELECT" ON quote_items;
DROP POLICY IF EXISTS "Permission-based quote_items INSERT" ON quote_items;
DROP POLICY IF EXISTS "Permission-based quote_items UPDATE" ON quote_items;
DROP POLICY IF EXISTS "Permission-based quote_items DELETE" ON quote_items;

-- Create permission-based SELECT policy for quote_items
CREATE POLICY "Permission-based quote_items SELECT"
ON quote_items FOR SELECT
USING (
  quote_id IN (
    SELECT q.id FROM quotes q
    WHERE is_same_account(q.user_id)
    AND (
      get_user_role(auth.uid()) IN ('System Owner', 'Owner')
      OR is_admin()
      OR has_permission('view_all_jobs')
      OR q.user_id = auth.uid()
      OR (has_permission('view_assigned_jobs') AND q.project_id IN (
        SELECT id FROM projects WHERE user_id = auth.uid()
      ))
    )
  )
);

-- Create permission-based INSERT policy for quote_items
CREATE POLICY "Permission-based quote_items INSERT"
ON quote_items FOR INSERT
WITH CHECK (
  quote_id IN (
    SELECT q.id FROM quotes q
    WHERE is_same_account(q.user_id)
    AND (
      get_user_role(auth.uid()) IN ('System Owner', 'Owner')
      OR is_admin()
      OR has_permission('edit_all_jobs')
      OR q.user_id = auth.uid()
      OR (has_permission('edit_assigned_jobs') AND q.project_id IN (
        SELECT id FROM projects WHERE user_id = auth.uid()
      ))
    )
  )
);

-- Create permission-based UPDATE policy for quote_items
CREATE POLICY "Permission-based quote_items UPDATE"
ON quote_items FOR UPDATE
USING (
  quote_id IN (
    SELECT q.id FROM quotes q
    WHERE is_same_account(q.user_id)
    AND (
      get_user_role(auth.uid()) IN ('System Owner', 'Owner')
      OR is_admin()
      OR has_permission('edit_all_jobs')
      OR q.user_id = auth.uid()
      OR (has_permission('edit_assigned_jobs') AND q.project_id IN (
        SELECT id FROM projects WHERE user_id = auth.uid()
      ))
    )
  )
);

-- Create permission-based DELETE policy for quote_items
CREATE POLICY "Permission-based quote_items DELETE"
ON quote_items FOR DELETE
USING (
  quote_id IN (
    SELECT q.id FROM quotes q
    WHERE is_same_account(q.user_id)
    AND (
      get_user_role(auth.uid()) IN ('System Owner', 'Owner')
      OR is_admin()
      OR has_permission('delete_jobs')
      OR q.user_id = auth.uid()
    )
  )
);

-- Step 3: Clean up treatments table (remove conflicting policies)
-- =====================================================

-- Drop old conflicting policies
DROP POLICY IF EXISTS "account_select" ON treatments;
DROP POLICY IF EXISTS "account_update" ON treatments;
DROP POLICY IF EXISTS "account_delete" ON treatments;
DROP POLICY IF EXISTS "account_insert" ON treatments;
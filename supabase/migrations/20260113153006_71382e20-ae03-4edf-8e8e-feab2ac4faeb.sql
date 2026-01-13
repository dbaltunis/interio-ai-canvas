-- =====================================================
-- FIX: Permission-Based RLS for windows_summary, rooms, window_coverings
-- These tables are blocking team member access and causing timeouts
-- =====================================================

-- Step 1: Fix windows_summary (currently only allows project owner)
-- =====================================================
DROP POLICY IF EXISTS "Users can manage own window summaries" ON windows_summary;

CREATE POLICY "Permission-based windows_summary SELECT"
ON windows_summary FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM surfaces s
    JOIN projects p ON s.project_id = p.id
    WHERE s.id = windows_summary.window_id
    AND is_same_account(p.user_id)
    AND (
      get_user_role(auth.uid()) IN ('System Owner', 'Owner')
      OR is_admin()
      OR has_permission('view_all_jobs')
      OR p.user_id = auth.uid()
      OR (has_permission('view_assigned_jobs') AND p.user_id = auth.uid())
    )
  )
);

CREATE POLICY "Permission-based windows_summary INSERT"
ON windows_summary FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM surfaces s
    JOIN projects p ON s.project_id = p.id
    WHERE s.id = windows_summary.window_id
    AND is_same_account(p.user_id)
    AND (
      get_user_role(auth.uid()) IN ('System Owner', 'Owner')
      OR is_admin()
      OR has_permission('edit_all_jobs')
      OR p.user_id = auth.uid()
    )
  )
);

CREATE POLICY "Permission-based windows_summary UPDATE"
ON windows_summary FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM surfaces s
    JOIN projects p ON s.project_id = p.id
    WHERE s.id = windows_summary.window_id
    AND is_same_account(p.user_id)
    AND (
      get_user_role(auth.uid()) IN ('System Owner', 'Owner')
      OR is_admin()
      OR has_permission('edit_all_jobs')
      OR p.user_id = auth.uid()
    )
  )
);

CREATE POLICY "Permission-based windows_summary DELETE"
ON windows_summary FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM surfaces s
    JOIN projects p ON s.project_id = p.id
    WHERE s.id = windows_summary.window_id
    AND is_same_account(p.user_id)
    AND (
      get_user_role(auth.uid()) IN ('System Owner', 'Owner')
      OR is_admin()
      OR has_permission('delete_jobs')
      OR p.user_id = auth.uid()
    )
  )
);

-- Step 2: Fix rooms table (has OLD get_effective_account_owner policies causing timeout)
-- =====================================================
DROP POLICY IF EXISTS "Account isolation - SELECT" ON rooms;
DROP POLICY IF EXISTS "Account isolation - UPDATE" ON rooms;
DROP POLICY IF EXISTS "Account isolation - DELETE" ON rooms;
DROP POLICY IF EXISTS "Account isolation - INSERT" ON rooms;
DROP POLICY IF EXISTS "account_select" ON rooms;
DROP POLICY IF EXISTS "account_update" ON rooms;
DROP POLICY IF EXISTS "account_delete" ON rooms;
DROP POLICY IF EXISTS "account_insert" ON rooms;
DROP POLICY IF EXISTS "Account members can create rooms" ON rooms;

-- Create optimized permission-based policies for rooms
CREATE POLICY "Permission-based rooms SELECT"
ON rooms FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = rooms.project_id
    AND is_same_account(p.user_id)
    AND (
      get_user_role(auth.uid()) IN ('System Owner', 'Owner')
      OR is_admin()
      OR has_permission('view_all_jobs')
      OR p.user_id = auth.uid()
    )
  )
);

CREATE POLICY "Permission-based rooms INSERT"
ON rooms FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = rooms.project_id
    AND is_same_account(p.user_id)
    AND (
      get_user_role(auth.uid()) IN ('System Owner', 'Owner')
      OR is_admin()
      OR has_permission('edit_all_jobs')
      OR p.user_id = auth.uid()
    )
  )
);

CREATE POLICY "Permission-based rooms UPDATE"
ON rooms FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = rooms.project_id
    AND is_same_account(p.user_id)
    AND (
      get_user_role(auth.uid()) IN ('System Owner', 'Owner')
      OR is_admin()
      OR has_permission('edit_all_jobs')
      OR p.user_id = auth.uid()
    )
  )
);

CREATE POLICY "Permission-based rooms DELETE"
ON rooms FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = rooms.project_id
    AND is_same_account(p.user_id)
    AND (
      get_user_role(auth.uid()) IN ('System Owner', 'Owner')
      OR is_admin()
      OR has_permission('delete_jobs')
      OR p.user_id = auth.uid()
    )
  )
);

-- Step 3: Fix window_coverings (uses get_effective_account_owner - causes timeout)
-- =====================================================
DROP POLICY IF EXISTS "Account isolation - SELECT" ON window_coverings;
DROP POLICY IF EXISTS "Account isolation - UPDATE" ON window_coverings;
DROP POLICY IF EXISTS "Account isolation - DELETE" ON window_coverings;
DROP POLICY IF EXISTS "Account isolation - INSERT" ON window_coverings;

CREATE POLICY "Permission-based window_coverings SELECT"
ON window_coverings FOR SELECT
USING (
  is_same_account(user_id)
  AND (
    get_user_role(auth.uid()) IN ('System Owner', 'Owner')
    OR is_admin()
    OR has_permission('view_all_jobs')
    OR auth.uid() = user_id
  )
);

CREATE POLICY "Permission-based window_coverings INSERT"
ON window_coverings FOR INSERT
WITH CHECK (
  is_same_account(user_id)
  AND (
    get_user_role(auth.uid()) IN ('System Owner', 'Owner')
    OR is_admin()
    OR has_permission('edit_all_jobs')
    OR auth.uid() = user_id
  )
);

CREATE POLICY "Permission-based window_coverings UPDATE"
ON window_coverings FOR UPDATE
USING (
  is_same_account(user_id)
  AND (
    get_user_role(auth.uid()) IN ('System Owner', 'Owner')
    OR is_admin()
    OR has_permission('edit_all_jobs')
    OR auth.uid() = user_id
  )
);

CREATE POLICY "Permission-based window_coverings DELETE"
ON window_coverings FOR DELETE
USING (
  is_same_account(user_id)
  AND (
    get_user_role(auth.uid()) IN ('System Owner', 'Owner')
    OR is_admin()
    OR has_permission('delete_jobs')
    OR auth.uid() = user_id
  )
);
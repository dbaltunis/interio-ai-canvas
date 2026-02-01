-- ============================================
-- CRITICAL FIX: windows_summary RLS Policies
-- Bug: Staff with view_assigned_jobs couldn't see pricing because policy checked ownership instead of assignment
-- ============================================

-- Fix SELECT policy - replace ownership check with assignment check
DROP POLICY IF EXISTS "Permission-based windows_summary SELECT" ON windows_summary;

CREATE POLICY "Permission-based windows_summary SELECT" ON windows_summary
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM surfaces s
    JOIN projects p ON s.project_id = p.id
    WHERE s.id = windows_summary.window_id
    AND is_same_account(p.user_id)
    AND (
      get_user_role(auth.uid()) = ANY (ARRAY['System Owner'::text, 'Owner'::text])
      OR is_admin()
      OR has_permission('view_all_jobs'::text)
      OR p.user_id = auth.uid()
      -- FIXED: Check assignment, not ownership
      OR (has_permission('view_assigned_jobs'::text) AND user_is_assigned_to_project(p.id))
    )
  )
);

-- Fix UPDATE policy - add assignment check for staff
DROP POLICY IF EXISTS "Permission-based windows_summary UPDATE" ON windows_summary;

CREATE POLICY "Permission-based windows_summary UPDATE" ON windows_summary
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM surfaces s
    JOIN projects p ON s.project_id = p.id
    WHERE s.id = windows_summary.window_id
    AND is_same_account(p.user_id)
    AND (
      get_user_role(auth.uid()) = ANY (ARRAY['System Owner'::text, 'Owner'::text])
      OR is_admin()
      OR has_permission('edit_all_jobs'::text)
      OR p.user_id = auth.uid()
      -- FIXED: Add assignment check for staff
      OR (has_permission('edit_assigned_jobs'::text) AND user_is_assigned_to_project(p.id))
    )
  )
);

-- ============================================
-- Restore Missing Surface (Room 1 Window 1)
-- ============================================

INSERT INTO surfaces (id, name, project_id, room_id, surface_type, user_id)
VALUES (
  'f1487737-0b86-4abf-addf-010b85618a43',
  'Window 1',
  '113a5360-eb1a-42bc-bff0-909821b9305b',
  '6ba3a29a-e702-4bc0-9a5e-c50a9904733c',
  'window',
  'b0c727dd-b9bf-4470-840d-1f630e8f2b26'
) ON CONFLICT (id) DO NOTHING;
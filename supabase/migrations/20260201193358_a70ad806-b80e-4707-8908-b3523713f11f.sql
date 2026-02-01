-- Fix workshop_items RLS policies to properly check project assignments for staff members
-- The current policies incorrectly check project.user_id = auth.uid() instead of user_is_assigned_to_project()

-- Drop the broken policies
DROP POLICY IF EXISTS "Permission-based workshop_items SELECT" ON workshop_items;
DROP POLICY IF EXISTS "Permission-based workshop_items UPDATE" ON workshop_items;
DROP POLICY IF EXISTS "Permission-based workshop_items DELETE" ON workshop_items;

-- Recreate SELECT policy with correct assignment check
CREATE POLICY "Permission-based workshop_items SELECT" ON workshop_items
FOR SELECT USING (
  is_same_account(user_id) AND (
    get_user_role(auth.uid()) = ANY (ARRAY['System Owner'::text, 'Owner'::text])
    OR is_admin()
    OR has_permission('view_all_jobs'::text)
    OR auth.uid() = user_id
    -- FIXED: Check if user is assigned to the project, not if they own it
    OR (has_permission('view_assigned_jobs'::text) AND user_is_assigned_to_project(project_id))
  )
);

-- Recreate UPDATE policy with correct assignment check
CREATE POLICY "Permission-based workshop_items UPDATE" ON workshop_items
FOR UPDATE USING (
  is_same_account(user_id) AND (
    get_user_role(auth.uid()) = ANY (ARRAY['System Owner'::text, 'Owner'::text])
    OR is_admin()
    OR has_permission('edit_all_jobs'::text)
    OR auth.uid() = user_id
    -- FIXED: Check if user is assigned to the project, not if they own it
    OR (has_permission('edit_assigned_jobs'::text) AND user_is_assigned_to_project(project_id))
  )
);

-- Recreate DELETE policy with correct assignment check
CREATE POLICY "Permission-based workshop_items DELETE" ON workshop_items
FOR DELETE USING (
  is_same_account(user_id) AND (
    get_user_role(auth.uid()) = ANY (ARRAY['System Owner'::text, 'Owner'::text])
    OR is_admin()
    OR has_permission('delete_jobs'::text)
    OR auth.uid() = user_id
    -- FIXED: Check if user is assigned to the project
    OR (has_permission('edit_assigned_jobs'::text) AND user_is_assigned_to_project(project_id))
  )
);
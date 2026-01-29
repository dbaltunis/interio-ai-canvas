-- Phase 1: Fix RLS Policies to check project_assignments for view_assigned_jobs permission
-- This is CRITICAL - without this, assigned users cannot see their jobs

-- 1. Create a SECURITY DEFINER helper function to check if user is assigned to a project
-- This avoids infinite recursion in RLS policies
CREATE OR REPLACE FUNCTION public.user_is_assigned_to_project(p_project_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM project_assignments 
    WHERE project_id = p_project_id 
    AND user_id = auth.uid() 
    AND is_active = true
  )
$$;

-- =====================================================
-- PROJECTS TABLE - Add view_assigned_jobs check
-- =====================================================

-- Drop existing SELECT policy and recreate with assignment check
DROP POLICY IF EXISTS "Permission-based project access" ON projects;
DROP POLICY IF EXISTS "Users can view their own projects" ON projects;
DROP POLICY IF EXISTS "projects_select_policy" ON projects;

CREATE POLICY "projects_select_policy" ON projects FOR SELECT
USING (
  public.get_effective_account_owner(auth.uid()) = public.get_effective_account_owner(user_id)
  AND (
    public.get_user_role(auth.uid()) = 'System Owner'
    OR public.get_user_role(auth.uid()) = 'Owner'
    OR public.is_admin()
    OR public.has_permission('view_all_jobs')
    OR public.has_permission('view_all_projects')
    OR (public.has_permission('view_own_jobs') AND auth.uid() = user_id)
    OR (public.has_permission('view_jobs') AND auth.uid() = user_id)
    OR (public.has_permission('create_jobs') AND auth.uid() = user_id)
    -- NEW: Check project_assignments for view_assigned_jobs
    OR (public.has_permission('view_assigned_jobs') AND public.user_is_assigned_to_project(id))
  )
);

-- Update UPDATE policy
DROP POLICY IF EXISTS "Permission-based project update" ON projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON projects;
DROP POLICY IF EXISTS "projects_update_policy" ON projects;

CREATE POLICY "projects_update_policy" ON projects FOR UPDATE
USING (
  public.get_effective_account_owner(auth.uid()) = public.get_effective_account_owner(user_id)
  AND (
    public.get_user_role(auth.uid()) = 'System Owner'
    OR public.get_user_role(auth.uid()) = 'Owner'
    OR public.is_admin()
    OR public.has_permission('edit_all_jobs')
    OR (public.has_permission('edit_own_jobs') AND auth.uid() = user_id)
    -- NEW: Allow assigned users to edit if they have edit_assigned_jobs
    OR (public.has_permission('edit_assigned_jobs') AND public.user_is_assigned_to_project(id))
  )
);

-- =====================================================
-- ROOMS TABLE - Add view_assigned_jobs check
-- =====================================================

DROP POLICY IF EXISTS "rooms_select_policy" ON rooms;
DROP POLICY IF EXISTS "Users can view rooms in their projects" ON rooms;

CREATE POLICY "rooms_select_policy" ON rooms FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = rooms.project_id
    AND public.get_effective_account_owner(auth.uid()) = public.get_effective_account_owner(p.user_id)
    AND (
      public.get_user_role(auth.uid()) = 'System Owner'
      OR public.get_user_role(auth.uid()) = 'Owner'
      OR public.is_admin()
      OR public.has_permission('view_all_jobs')
      OR (public.has_permission('view_own_jobs') AND auth.uid() = p.user_id)
      OR (public.has_permission('view_jobs') AND auth.uid() = p.user_id)
      -- NEW: Check project_assignments for view_assigned_jobs
      OR (public.has_permission('view_assigned_jobs') AND public.user_is_assigned_to_project(p.id))
    )
  )
);

DROP POLICY IF EXISTS "rooms_update_policy" ON rooms;
DROP POLICY IF EXISTS "Users can update rooms in their projects" ON rooms;

CREATE POLICY "rooms_update_policy" ON rooms FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = rooms.project_id
    AND public.get_effective_account_owner(auth.uid()) = public.get_effective_account_owner(p.user_id)
    AND (
      public.get_user_role(auth.uid()) = 'System Owner'
      OR public.get_user_role(auth.uid()) = 'Owner'
      OR public.is_admin()
      OR public.has_permission('edit_all_jobs')
      OR (public.has_permission('edit_own_jobs') AND auth.uid() = p.user_id)
      OR (public.has_permission('edit_assigned_jobs') AND public.user_is_assigned_to_project(p.id))
    )
  )
);

DROP POLICY IF EXISTS "rooms_insert_policy" ON rooms;
DROP POLICY IF EXISTS "Users can insert rooms in their projects" ON rooms;

CREATE POLICY "rooms_insert_policy" ON rooms FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = rooms.project_id
    AND public.get_effective_account_owner(auth.uid()) = public.get_effective_account_owner(p.user_id)
    AND (
      public.get_user_role(auth.uid()) = 'System Owner'
      OR public.get_user_role(auth.uid()) = 'Owner'
      OR public.is_admin()
      OR public.has_permission('edit_all_jobs')
      OR (public.has_permission('edit_own_jobs') AND auth.uid() = p.user_id)
      OR (public.has_permission('edit_assigned_jobs') AND public.user_is_assigned_to_project(p.id))
    )
  )
);

DROP POLICY IF EXISTS "rooms_delete_policy" ON rooms;
DROP POLICY IF EXISTS "Users can delete rooms in their projects" ON rooms;

CREATE POLICY "rooms_delete_policy" ON rooms FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = rooms.project_id
    AND public.get_effective_account_owner(auth.uid()) = public.get_effective_account_owner(p.user_id)
    AND (
      public.get_user_role(auth.uid()) = 'System Owner'
      OR public.get_user_role(auth.uid()) = 'Owner'
      OR public.is_admin()
      OR public.has_permission('edit_all_jobs')
      OR (public.has_permission('edit_own_jobs') AND auth.uid() = p.user_id)
      OR (public.has_permission('edit_assigned_jobs') AND public.user_is_assigned_to_project(p.id))
    )
  )
);

-- =====================================================
-- SURFACES TABLE - Add view_assigned_jobs check
-- =====================================================

DROP POLICY IF EXISTS "surfaces_select_policy" ON surfaces;
DROP POLICY IF EXISTS "Users can view surfaces in their projects" ON surfaces;

CREATE POLICY "surfaces_select_policy" ON surfaces FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM rooms rm
    JOIN projects p ON rm.project_id = p.id
    WHERE rm.id = surfaces.room_id
    AND public.get_effective_account_owner(auth.uid()) = public.get_effective_account_owner(p.user_id)
    AND (
      public.get_user_role(auth.uid()) = 'System Owner'
      OR public.get_user_role(auth.uid()) = 'Owner'
      OR public.is_admin()
      OR public.has_permission('view_all_jobs')
      OR (public.has_permission('view_own_jobs') AND auth.uid() = p.user_id)
      OR (public.has_permission('view_jobs') AND auth.uid() = p.user_id)
      -- NEW: Check project_assignments for view_assigned_jobs
      OR (public.has_permission('view_assigned_jobs') AND public.user_is_assigned_to_project(p.id))
    )
  )
);

DROP POLICY IF EXISTS "surfaces_update_policy" ON surfaces;
DROP POLICY IF EXISTS "Users can update surfaces in their projects" ON surfaces;

CREATE POLICY "surfaces_update_policy" ON surfaces FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM rooms rm
    JOIN projects p ON rm.project_id = p.id
    WHERE rm.id = surfaces.room_id
    AND public.get_effective_account_owner(auth.uid()) = public.get_effective_account_owner(p.user_id)
    AND (
      public.get_user_role(auth.uid()) = 'System Owner'
      OR public.get_user_role(auth.uid()) = 'Owner'
      OR public.is_admin()
      OR public.has_permission('edit_all_jobs')
      OR (public.has_permission('edit_own_jobs') AND auth.uid() = p.user_id)
      OR (public.has_permission('edit_assigned_jobs') AND public.user_is_assigned_to_project(p.id))
    )
  )
);

DROP POLICY IF EXISTS "surfaces_insert_policy" ON surfaces;
DROP POLICY IF EXISTS "Users can insert surfaces in their projects" ON surfaces;

CREATE POLICY "surfaces_insert_policy" ON surfaces FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM rooms rm
    JOIN projects p ON rm.project_id = p.id
    WHERE rm.id = surfaces.room_id
    AND public.get_effective_account_owner(auth.uid()) = public.get_effective_account_owner(p.user_id)
    AND (
      public.get_user_role(auth.uid()) = 'System Owner'
      OR public.get_user_role(auth.uid()) = 'Owner'
      OR public.is_admin()
      OR public.has_permission('edit_all_jobs')
      OR (public.has_permission('edit_own_jobs') AND auth.uid() = p.user_id)
      OR (public.has_permission('edit_assigned_jobs') AND public.user_is_assigned_to_project(p.id))
    )
  )
);

DROP POLICY IF EXISTS "surfaces_delete_policy" ON surfaces;
DROP POLICY IF EXISTS "Users can delete surfaces in their projects" ON surfaces;

CREATE POLICY "surfaces_delete_policy" ON surfaces FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM rooms rm
    JOIN projects p ON rm.project_id = p.id
    WHERE rm.id = surfaces.room_id
    AND public.get_effective_account_owner(auth.uid()) = public.get_effective_account_owner(p.user_id)
    AND (
      public.get_user_role(auth.uid()) = 'System Owner'
      OR public.get_user_role(auth.uid()) = 'Owner'
      OR public.is_admin()
      OR public.has_permission('edit_all_jobs')
      OR (public.has_permission('edit_own_jobs') AND auth.uid() = p.user_id)
      OR (public.has_permission('edit_assigned_jobs') AND public.user_is_assigned_to_project(p.id))
    )
  )
);

-- =====================================================
-- TREATMENTS TABLE - Add view_assigned_jobs check
-- (treatments has project_id directly)
-- =====================================================

DROP POLICY IF EXISTS "treatments_select_policy" ON treatments;
DROP POLICY IF EXISTS "Users can view treatments in their projects" ON treatments;

CREATE POLICY "treatments_select_policy" ON treatments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = treatments.project_id
    AND public.get_effective_account_owner(auth.uid()) = public.get_effective_account_owner(p.user_id)
    AND (
      public.get_user_role(auth.uid()) = 'System Owner'
      OR public.get_user_role(auth.uid()) = 'Owner'
      OR public.is_admin()
      OR public.has_permission('view_all_jobs')
      OR (public.has_permission('view_own_jobs') AND auth.uid() = p.user_id)
      OR (public.has_permission('view_jobs') AND auth.uid() = p.user_id)
      -- NEW: Check project_assignments for view_assigned_jobs
      OR (public.has_permission('view_assigned_jobs') AND public.user_is_assigned_to_project(p.id))
    )
  )
);

DROP POLICY IF EXISTS "treatments_update_policy" ON treatments;
DROP POLICY IF EXISTS "Users can update treatments in their projects" ON treatments;

CREATE POLICY "treatments_update_policy" ON treatments FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = treatments.project_id
    AND public.get_effective_account_owner(auth.uid()) = public.get_effective_account_owner(p.user_id)
    AND (
      public.get_user_role(auth.uid()) = 'System Owner'
      OR public.get_user_role(auth.uid()) = 'Owner'
      OR public.is_admin()
      OR public.has_permission('edit_all_jobs')
      OR (public.has_permission('edit_own_jobs') AND auth.uid() = p.user_id)
      OR (public.has_permission('edit_assigned_jobs') AND public.user_is_assigned_to_project(p.id))
    )
  )
);

DROP POLICY IF EXISTS "treatments_insert_policy" ON treatments;
DROP POLICY IF EXISTS "Users can insert treatments in their projects" ON treatments;

CREATE POLICY "treatments_insert_policy" ON treatments FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = treatments.project_id
    AND public.get_effective_account_owner(auth.uid()) = public.get_effective_account_owner(p.user_id)
    AND (
      public.get_user_role(auth.uid()) = 'System Owner'
      OR public.get_user_role(auth.uid()) = 'Owner'
      OR public.is_admin()
      OR public.has_permission('edit_all_jobs')
      OR (public.has_permission('edit_own_jobs') AND auth.uid() = p.user_id)
      OR (public.has_permission('edit_assigned_jobs') AND public.user_is_assigned_to_project(p.id))
    )
  )
);

DROP POLICY IF EXISTS "treatments_delete_policy" ON treatments;
DROP POLICY IF EXISTS "Users can delete treatments in their projects" ON treatments;

CREATE POLICY "treatments_delete_policy" ON treatments FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = treatments.project_id
    AND public.get_effective_account_owner(auth.uid()) = public.get_effective_account_owner(p.user_id)
    AND (
      public.get_user_role(auth.uid()) = 'System Owner'
      OR public.get_user_role(auth.uid()) = 'Owner'
      OR public.is_admin()
      OR public.has_permission('edit_all_jobs')
      OR (public.has_permission('edit_own_jobs') AND auth.uid() = p.user_id)
      OR (public.has_permission('edit_assigned_jobs') AND public.user_is_assigned_to_project(p.id))
    )
  )
);

-- =====================================================
-- QUOTES TABLE - Add view_assigned_jobs check
-- =====================================================

DROP POLICY IF EXISTS "quotes_select_policy" ON quotes;
DROP POLICY IF EXISTS "Users can view quotes in their projects" ON quotes;

CREATE POLICY "quotes_select_policy" ON quotes FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = quotes.project_id
    AND public.get_effective_account_owner(auth.uid()) = public.get_effective_account_owner(p.user_id)
    AND (
      public.get_user_role(auth.uid()) = 'System Owner'
      OR public.get_user_role(auth.uid()) = 'Owner'
      OR public.is_admin()
      OR public.has_permission('view_all_jobs')
      OR (public.has_permission('view_own_jobs') AND auth.uid() = p.user_id)
      OR (public.has_permission('view_jobs') AND auth.uid() = p.user_id)
      -- NEW: Check project_assignments for view_assigned_jobs
      OR (public.has_permission('view_assigned_jobs') AND public.user_is_assigned_to_project(p.id))
    )
  )
);

DROP POLICY IF EXISTS "quotes_update_policy" ON quotes;
DROP POLICY IF EXISTS "Users can update quotes in their projects" ON quotes;

CREATE POLICY "quotes_update_policy" ON quotes FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = quotes.project_id
    AND public.get_effective_account_owner(auth.uid()) = public.get_effective_account_owner(p.user_id)
    AND (
      public.get_user_role(auth.uid()) = 'System Owner'
      OR public.get_user_role(auth.uid()) = 'Owner'
      OR public.is_admin()
      OR public.has_permission('edit_all_jobs')
      OR (public.has_permission('edit_own_jobs') AND auth.uid() = p.user_id)
      OR (public.has_permission('edit_assigned_jobs') AND public.user_is_assigned_to_project(p.id))
    )
  )
);

DROP POLICY IF EXISTS "quotes_insert_policy" ON quotes;
DROP POLICY IF EXISTS "Users can insert quotes in their projects" ON quotes;

CREATE POLICY "quotes_insert_policy" ON quotes FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = quotes.project_id
    AND public.get_effective_account_owner(auth.uid()) = public.get_effective_account_owner(p.user_id)
    AND (
      public.get_user_role(auth.uid()) = 'System Owner'
      OR public.get_user_role(auth.uid()) = 'Owner'
      OR public.is_admin()
      OR public.has_permission('edit_all_jobs')
      OR (public.has_permission('edit_own_jobs') AND auth.uid() = p.user_id)
      OR (public.has_permission('edit_assigned_jobs') AND public.user_is_assigned_to_project(p.id))
    )
  )
);

DROP POLICY IF EXISTS "quotes_delete_policy" ON quotes;
DROP POLICY IF EXISTS "Users can delete quotes in their projects" ON quotes;

CREATE POLICY "quotes_delete_policy" ON quotes FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = quotes.project_id
    AND public.get_effective_account_owner(auth.uid()) = public.get_effective_account_owner(p.user_id)
    AND (
      public.get_user_role(auth.uid()) = 'System Owner'
      OR public.get_user_role(auth.uid()) = 'Owner'
      OR public.is_admin()
      OR public.has_permission('edit_all_jobs')
      OR (public.has_permission('edit_own_jobs') AND auth.uid() = p.user_id)
      OR (public.has_permission('edit_assigned_jobs') AND public.user_is_assigned_to_project(p.id))
    )
  )
);
-- Fix RLS policies for rooms, surfaces, and treatments to respect project-level permissions
-- This allows users to access rooms/surfaces/treatments if they can access the parent project

-- Drop existing overly restrictive policies
DROP POLICY IF EXISTS "Users can view their own rooms" ON public.rooms;
DROP POLICY IF EXISTS "Users can update their own rooms" ON public.rooms;
DROP POLICY IF EXISTS "Users can delete their own rooms" ON public.rooms;

DROP POLICY IF EXISTS "Users can view their own surfaces" ON public.surfaces;
DROP POLICY IF EXISTS "Users can update their own surfaces" ON public.surfaces;
DROP POLICY IF EXISTS "Users can delete their own surfaces" ON public.surfaces;

DROP POLICY IF EXISTS "Users can view their own treatments" ON public.treatments;
DROP POLICY IF EXISTS "Users can update their own treatments" ON public.treatments;
DROP POLICY IF EXISTS "Users can delete their own treatments" ON public.treatments;

-- Create new policies that check project access

-- ROOMS policies
CREATE POLICY "Users can view rooms for accessible projects" 
ON public.rooms 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = rooms.project_id
    AND (
      p.user_id = auth.uid()
      OR get_account_owner(auth.uid()) = get_account_owner(p.user_id)
      OR has_permission('view_all_projects')
      OR has_permission('view_all_jobs')
    )
  )
);

CREATE POLICY "Users can update rooms for accessible projects" 
ON public.rooms 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = rooms.project_id
    AND (
      p.user_id = auth.uid()
      OR get_account_owner(auth.uid()) = get_account_owner(p.user_id)
      OR has_permission('edit_all_projects')
    )
  )
);

CREATE POLICY "Users can delete rooms for accessible projects" 
ON public.rooms 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = rooms.project_id
    AND (
      p.user_id = auth.uid()
      OR get_account_owner(auth.uid()) = get_account_owner(p.user_id)
      OR has_permission('delete_jobs')
    )
  )
);

-- SURFACES policies
CREATE POLICY "Users can view surfaces for accessible projects" 
ON public.surfaces 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = surfaces.project_id
    AND (
      p.user_id = auth.uid()
      OR get_account_owner(auth.uid()) = get_account_owner(p.user_id)
      OR has_permission('view_all_projects')
      OR has_permission('view_all_jobs')
    )
  )
);

CREATE POLICY "Users can update surfaces for accessible projects" 
ON public.surfaces 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = surfaces.project_id
    AND (
      p.user_id = auth.uid()
      OR get_account_owner(auth.uid()) = get_account_owner(p.user_id)
      OR has_permission('edit_all_projects')
    )
  )
);

CREATE POLICY "Users can delete surfaces for accessible projects" 
ON public.surfaces 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = surfaces.project_id
    AND (
      p.user_id = auth.uid()
      OR get_account_owner(auth.uid()) = get_account_owner(p.user_id)
      OR has_permission('delete_jobs')
    )
  )
);

-- TREATMENTS policies
CREATE POLICY "Users can view treatments for accessible projects" 
ON public.treatments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = treatments.project_id
    AND (
      p.user_id = auth.uid()
      OR get_account_owner(auth.uid()) = get_account_owner(p.user_id)
      OR has_permission('view_all_projects')
      OR has_permission('view_all_jobs')
    )
  )
);

CREATE POLICY "Users can update treatments for accessible projects" 
ON public.treatments 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = treatments.project_id
    AND (
      p.user_id = auth.uid()
      OR get_account_owner(auth.uid()) = get_account_owner(p.user_id)
      OR has_permission('edit_all_projects')
    )
  )
);

CREATE POLICY "Users can delete treatments for accessible projects" 
ON public.treatments 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = treatments.project_id
    AND (
      p.user_id = auth.uid()
      OR get_account_owner(auth.uid()) = get_account_owner(p.user_id)
      OR has_permission('delete_jobs')
    )
  )
);
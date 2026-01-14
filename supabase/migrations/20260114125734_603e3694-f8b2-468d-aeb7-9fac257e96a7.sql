-- Fix RLS: Allow project owners to see all shares for their projects (including viewer-created ones)
-- First drop the existing overly-restrictive policy
DROP POLICY IF EXISTS "Users can manage their own work order shares" ON public.work_order_shares;

-- Create better policies for authenticated users
-- 1. Project owners can see ALL shares for their projects
CREATE POLICY "Project owners can view all shares"
ON public.work_order_shares
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.projects p 
    WHERE p.id = project_id 
    AND p.user_id = auth.uid()
  )
);

-- 2. Project owners can insert shares
CREATE POLICY "Project owners can insert shares"
ON public.work_order_shares
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.projects p 
    WHERE p.id = project_id 
    AND p.user_id = auth.uid()
  )
);

-- 3. Project owners can update/delete shares
CREATE POLICY "Project owners can update shares"
ON public.work_order_shares
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.projects p 
    WHERE p.id = project_id 
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Project owners can delete shares"
ON public.work_order_shares
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.projects p 
    WHERE p.id = project_id 
    AND p.user_id = auth.uid()
  )
);
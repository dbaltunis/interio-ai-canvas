-- Fix infinite recursion in RLS policies for share link access
-- Creates SECURITY DEFINER functions that bypass RLS to check share link status

-- Step 1: Create security definer function for projects
CREATE OR REPLACE FUNCTION public.project_has_active_share_link(project_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM work_order_share_links
    WHERE project_id = project_uuid
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > now())
  )
$$;

-- Step 2: Update projects policy to use the function
DROP POLICY IF EXISTS "Allow public read access via share link" ON projects;
CREATE POLICY "Allow public read access via share link"
ON projects FOR SELECT TO anon, authenticated
USING (
  (work_order_token IS NOT NULL AND work_order_shared_at IS NOT NULL)
  OR
  public.project_has_active_share_link(id)
);

-- Step 3: Create security definer function for workshop_items
CREATE OR REPLACE FUNCTION public.workshop_item_has_active_share_link(p_project_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM work_order_share_links
    WHERE project_id = p_project_id
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > now())
  )
$$;

-- Step 4: Update workshop_items policy
DROP POLICY IF EXISTS "Allow public read access via share link" ON workshop_items;
CREATE POLICY "Allow public read access via share link"
ON workshop_items FOR SELECT TO anon, authenticated
USING (
  public.workshop_item_has_active_share_link(project_id)
);

-- Step 5: Create security definer function for clients
CREATE OR REPLACE FUNCTION public.client_has_active_share_link(client_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM work_order_share_links wsl
    JOIN projects p ON p.id = wsl.project_id
    WHERE p.client_id = client_uuid
    AND wsl.is_active = true
    AND (wsl.expires_at IS NULL OR wsl.expires_at > now())
  )
$$;

-- Step 6: Update clients policy
DROP POLICY IF EXISTS "Allow public read access via share link" ON clients;
CREATE POLICY "Allow public read access via share link"
ON clients FOR SELECT TO anon, authenticated
USING (
  public.client_has_active_share_link(id)
);
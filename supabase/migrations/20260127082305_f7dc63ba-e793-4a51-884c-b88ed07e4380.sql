-- ============================================================
-- CRITICAL FIX: Data Isolation Bug - Share Link RLS Policies
-- Issue: Share link policies applied to 'authenticated' role
--        caused ALL projects with share links to be visible
--        to ALL logged-in users, breaking multi-tenant isolation.
-- Fix: Restrict share link policies to 'anon' role only.
-- ============================================================

-- Part 1: Fix projects table
DROP POLICY IF EXISTS "Allow public read access via share link" ON projects;

CREATE POLICY "Allow public read access via share link"
ON projects FOR SELECT TO anon
USING (
  (work_order_token IS NOT NULL AND work_order_shared_at IS NOT NULL)
  OR
  public.project_has_active_share_link(id)
);

-- Part 2: Fix clients table
DROP POLICY IF EXISTS "Allow public read access via share link" ON clients;
DROP POLICY IF EXISTS "Allow public read access to clients via share link" ON clients;

CREATE POLICY "Allow public read access via share link"
ON clients FOR SELECT TO anon
USING (public.client_has_active_share_link(id));

-- Part 3: Fix workshop_items table
DROP POLICY IF EXISTS "Allow public read access via share link" ON workshop_items;

CREATE POLICY "Allow public read access via share link"
ON workshop_items FOR SELECT TO anon
USING (
  project_id IN (
    SELECT id FROM projects 
    WHERE (work_order_token IS NOT NULL AND work_order_shared_at IS NOT NULL)
    OR public.project_has_active_share_link(id)
  )
);
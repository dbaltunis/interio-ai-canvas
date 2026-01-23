-- =============================================
-- Fix share link RLS to work for logged-in users
-- =============================================

-- 1. work_order_share_links
DROP POLICY IF EXISTS "Public can read share links by token" ON work_order_share_links;
CREATE POLICY "Public can read share links by token"
ON work_order_share_links FOR SELECT TO anon, authenticated
USING (
  is_active = true 
  AND (expires_at IS NULL OR expires_at > now())
);

-- 2. projects
DROP POLICY IF EXISTS "Allow public read access via share link" ON projects;
CREATE POLICY "Allow public read access via share link"
ON projects FOR SELECT TO anon, authenticated
USING (
  (work_order_token IS NOT NULL AND work_order_shared_at IS NOT NULL)
  OR
  id IN (
    SELECT project_id FROM work_order_share_links 
    WHERE is_active = true 
    AND (expires_at IS NULL OR expires_at > now())
  )
);

-- 3. workshop_items
DROP POLICY IF EXISTS "Allow public read access to workshop_items via share link" ON workshop_items;
CREATE POLICY "Allow public read access to workshop_items via share link"
ON workshop_items FOR SELECT TO anon, authenticated
USING (
  project_id IN (
    SELECT id FROM projects
    WHERE (work_order_token IS NOT NULL AND work_order_shared_at IS NOT NULL)
  )
  OR
  project_id IN (
    SELECT project_id FROM work_order_share_links 
    WHERE is_active = true 
    AND (expires_at IS NULL OR expires_at > now())
  )
);

-- 4. clients
DROP POLICY IF EXISTS "Allow public read access to clients via share link" ON clients;
CREATE POLICY "Allow public read access to clients via share link"
ON clients FOR SELECT TO anon, authenticated
USING (
  id IN (
    SELECT client_id FROM projects
    WHERE (work_order_token IS NOT NULL AND work_order_shared_at IS NOT NULL)
  )
  OR
  id IN (
    SELECT p.client_id FROM projects p
    WHERE p.id IN (
      SELECT project_id FROM work_order_share_links 
      WHERE is_active = true 
      AND (expires_at IS NULL OR expires_at > now())
    )
  )
);

-- 5. work_order_shares - viewer session policies
DROP POLICY IF EXISTS "Allow anonymous viewers to create their own session" ON work_order_shares;
CREATE POLICY "Allow viewers to create their own session"
ON work_order_shares FOR INSERT TO anon, authenticated
WITH CHECK (
  created_by_viewer = true 
  AND shared_by IS NULL
);

DROP POLICY IF EXISTS "Allow anonymous viewers to read their own session" ON work_order_shares;
CREATE POLICY "Allow viewers to read their own session"
ON work_order_shares FOR SELECT TO anon, authenticated
USING (session_token IS NOT NULL);

DROP POLICY IF EXISTS "Allow anonymous viewers to update their own session" ON work_order_shares;
CREATE POLICY "Allow viewers to update their own session"
ON work_order_shares FOR UPDATE TO anon, authenticated
USING (session_token IS NOT NULL AND created_by_viewer = true);
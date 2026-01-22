-- Fix Share Link RLS Policies
-- Updates policies to recognize both old (work_order_token) and new (work_order_share_links) systems

-- =============================================
-- 1. Update projects table policy
-- =============================================
DROP POLICY IF EXISTS "Allow public read access via work_order_token" ON projects;

CREATE POLICY "Allow public read access via share link"
ON projects FOR SELECT TO anon
USING (
  -- Old system (backward compatible)
  (work_order_token IS NOT NULL AND work_order_shared_at IS NOT NULL)
  OR
  -- New system: has active share link
  id IN (
    SELECT project_id FROM work_order_share_links 
    WHERE is_active = true 
    AND (expires_at IS NULL OR expires_at > now())
  )
);

-- =============================================
-- 2. Update workshop_items table policy
-- =============================================
DROP POLICY IF EXISTS "Allow public read access to workshop_items via shared project" ON workshop_items;

CREATE POLICY "Allow public read access to workshop_items via share link"
ON workshop_items FOR SELECT TO anon
USING (
  -- Old system
  project_id IN (
    SELECT id FROM projects 
    WHERE work_order_token IS NOT NULL 
    AND work_order_shared_at IS NOT NULL
  )
  OR
  -- New system
  project_id IN (
    SELECT project_id FROM work_order_share_links 
    WHERE is_active = true 
    AND (expires_at IS NULL OR expires_at > now())
  )
);

-- =============================================
-- 3. Update clients table policy
-- =============================================
DROP POLICY IF EXISTS "Allow public read access to clients via shared project" ON clients;

CREATE POLICY "Allow public read access to clients via share link"
ON clients FOR SELECT TO anon
USING (
  -- Old system
  id IN (
    SELECT client_id FROM projects 
    WHERE work_order_token IS NOT NULL 
    AND work_order_shared_at IS NOT NULL
  )
  OR
  -- New system
  id IN (
    SELECT client_id FROM projects 
    WHERE id IN (
      SELECT project_id FROM work_order_share_links 
      WHERE is_active = true 
      AND (expires_at IS NULL OR expires_at > now())
    )
  )
);
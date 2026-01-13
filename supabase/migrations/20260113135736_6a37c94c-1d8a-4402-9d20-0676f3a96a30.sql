-- Allow anonymous users to read treatments for shared projects
CREATE POLICY "Allow public read access to treatments via shared project"
ON treatments
FOR SELECT
TO anon
USING (
  project_id IN (
    SELECT id FROM projects 
    WHERE work_order_token IS NOT NULL 
    AND work_order_shared_at IS NOT NULL
  )
);

-- Allow anonymous users to read rooms for shared projects
CREATE POLICY "Allow public read access to rooms via shared project"
ON rooms
FOR SELECT
TO anon
USING (
  project_id IN (
    SELECT id FROM projects 
    WHERE work_order_token IS NOT NULL 
    AND work_order_shared_at IS NOT NULL
  )
);

-- Allow anonymous users to read limited client data for shared projects
CREATE POLICY "Allow public read access to clients via shared project"
ON clients
FOR SELECT
TO anon
USING (
  id IN (
    SELECT client_id FROM projects 
    WHERE work_order_token IS NOT NULL 
    AND work_order_shared_at IS NOT NULL
  )
);
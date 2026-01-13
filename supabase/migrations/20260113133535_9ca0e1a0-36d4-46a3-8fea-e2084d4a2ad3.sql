-- Add work order sharing columns to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS work_order_token TEXT UNIQUE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS work_order_pin TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS work_order_shared_at TIMESTAMPTZ;

-- Create index for fast token lookups
CREATE INDEX IF NOT EXISTS idx_projects_work_order_token ON projects(work_order_token) WHERE work_order_token IS NOT NULL;

-- Create RLS policy for public access to projects via token
CREATE POLICY "Allow public read access via work_order_token"
ON projects
FOR SELECT
TO anon
USING (work_order_token IS NOT NULL AND work_order_shared_at IS NOT NULL);
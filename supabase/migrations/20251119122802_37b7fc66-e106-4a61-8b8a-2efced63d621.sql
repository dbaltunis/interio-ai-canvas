-- Add fabric_pools column to projects table for tracking leftover fabric across surfaces
ALTER TABLE projects 
ADD COLUMN fabric_pools JSONB DEFAULT '{}'::jsonb;

-- Add GIN index for better query performance on JSONB column
CREATE INDEX idx_projects_fabric_pools ON projects USING gin(fabric_pools);

-- Add comment explaining the column purpose
COMMENT ON COLUMN projects.fabric_pools IS 'Tracks fabric inventory pool for the entire project, enabling leftover reuse across surfaces. Structure: { fabricId: { fabricId, fabricName, totalOrdered, totalUsed, availableLeftover, surfaces: [...] } }';
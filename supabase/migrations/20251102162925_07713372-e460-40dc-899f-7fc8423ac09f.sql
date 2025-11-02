-- Add parent_job_id to track job duplicates
ALTER TABLE projects 
ADD COLUMN parent_job_id UUID REFERENCES projects(id) ON DELETE SET NULL;

-- Add index for faster lookups
CREATE INDEX idx_projects_parent_job_id ON projects(parent_job_id);

-- Add comment to explain the field
COMMENT ON COLUMN projects.parent_job_id IS 'Reference to the original job if this is a duplicate';
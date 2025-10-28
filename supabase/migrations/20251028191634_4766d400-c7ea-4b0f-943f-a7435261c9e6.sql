-- Phase 1.2: Add status_id columns to projects and quotes tables
-- Add new status_id column (will eventually replace the text status column)
ALTER TABLE projects
ADD COLUMN status_id UUID REFERENCES job_statuses(id);

ALTER TABLE quotes
ADD COLUMN status_id UUID REFERENCES job_statuses(id);

-- Create indexes for better query performance
CREATE INDEX idx_projects_status_id ON projects(status_id);
CREATE INDEX idx_quotes_status_id ON quotes(status_id);

-- Comments for clarity
COMMENT ON COLUMN projects.status_id IS 'Foreign key to job_statuses table - replaces text-based status column';
COMMENT ON COLUMN quotes.status_id IS 'Foreign key to job_statuses table - replaces text-based status column';
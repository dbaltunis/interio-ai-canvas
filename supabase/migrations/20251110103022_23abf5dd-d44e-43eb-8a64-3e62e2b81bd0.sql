-- Add target_fix_date to bug_reports for roadmap planning
ALTER TABLE bug_reports
ADD COLUMN IF NOT EXISTS target_fix_date DATE;

-- Add index for efficient date-based queries
CREATE INDEX IF NOT EXISTS idx_bug_reports_target_fix_date 
ON bug_reports(target_fix_date) 
WHERE target_fix_date IS NOT NULL;
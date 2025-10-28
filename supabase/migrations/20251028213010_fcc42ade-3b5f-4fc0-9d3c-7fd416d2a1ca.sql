-- Set default status for all projects with NULL status_id
-- Use the first active Project status (should be Planning or Draft)
UPDATE projects 
SET status_id = (
  SELECT id FROM job_statuses 
  WHERE user_id = projects.user_id 
  AND category = 'Project' 
  AND is_active = true 
  ORDER BY sort_order ASC 
  LIMIT 1
)
WHERE status_id IS NULL;

-- Set default status for all quotes with NULL status_id  
-- Use the first active Quote status (should be Draft)
UPDATE quotes
SET status_id = (
  SELECT id FROM job_statuses 
  WHERE user_id = quotes.user_id 
  AND category = 'Quote' 
  AND is_active = true 
  ORDER BY sort_order ASC 
  LIMIT 1
)
WHERE status_id IS NULL;
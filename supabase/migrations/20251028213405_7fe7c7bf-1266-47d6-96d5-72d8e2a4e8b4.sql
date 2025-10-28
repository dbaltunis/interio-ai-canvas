
-- Activate the Planning status in slot 5
UPDATE job_statuses
SET is_active = true
WHERE user_id = 'ec930f73-ef23-4430-921f-1b401859825d'
AND slot_number = 5;

-- Update all projects with NULL status to use slot 5 (Planning)
UPDATE projects 
SET status_id = (
  SELECT id FROM job_statuses 
  WHERE user_id = 'ec930f73-ef23-4430-921f-1b401859825d'
  AND slot_number = 5
  LIMIT 1
)
WHERE user_id = 'ec930f73-ef23-4430-921f-1b401859825d'
AND status_id IS NULL;

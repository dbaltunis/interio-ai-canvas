-- Reactivate the Completed status for Projects
UPDATE job_statuses 
SET is_active = true 
WHERE name = 'Completed' AND category = 'Project';

-- Make sure we have the basic Project statuses active
UPDATE job_statuses 
SET is_active = true 
WHERE category = 'Project';
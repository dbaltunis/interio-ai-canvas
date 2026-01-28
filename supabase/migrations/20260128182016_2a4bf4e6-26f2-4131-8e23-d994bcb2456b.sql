-- Fix Rejected statuses to require reason
UPDATE job_statuses 
SET action = 'requires_reason' 
WHERE name = 'Rejected';

-- Fix Cancelled statuses to require reason
UPDATE job_statuses 
SET action = 'requires_reason' 
WHERE name = 'Cancelled';

-- Fix On Hold to require reason
UPDATE job_statuses 
SET action = 'requires_reason' 
WHERE name = 'On Hold';
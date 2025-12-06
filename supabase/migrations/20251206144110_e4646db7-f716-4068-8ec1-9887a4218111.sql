-- Sync all stale status records with their status_id names
UPDATE projects p
SET status = js.name
FROM job_statuses js
WHERE p.status_id = js.id
  AND (p.status IS NULL OR p.status != js.name);
-- Sync projects.status with job_statuses.name
UPDATE projects p
SET status = js.name
FROM job_statuses js
WHERE p.status_id = js.id
  AND (p.status IS NULL OR p.status != js.name);

-- Clean up quote_number values that incorrectly contain JOB- prefix
UPDATE quotes
SET quote_number = NULL
WHERE quote_number LIKE 'JOB-%';
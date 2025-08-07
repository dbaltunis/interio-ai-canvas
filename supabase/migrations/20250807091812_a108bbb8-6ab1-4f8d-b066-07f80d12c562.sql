-- Remove duplicate job statuses and keep only unique ones
DELETE FROM job_statuses 
WHERE id NOT IN (
  SELECT DISTINCT ON (name, category) id 
  FROM job_statuses 
  WHERE is_active = true
  ORDER BY name, category, created_at
);
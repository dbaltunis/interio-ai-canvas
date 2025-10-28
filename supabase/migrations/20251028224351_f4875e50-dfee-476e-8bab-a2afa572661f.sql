-- Fix version numbers for all quotes in the system
-- This will properly set version numbers based on creation order per project

WITH ordered_quotes AS (
  SELECT 
    id,
    project_id,
    ROW_NUMBER() OVER (PARTITION BY project_id ORDER BY created_at) as correct_version
  FROM quotes
)
UPDATE quotes q
SET version = oq.correct_version
FROM ordered_quotes oq
WHERE q.id = oq.id;
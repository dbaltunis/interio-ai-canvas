-- Clean up duplicate treatment_options
-- Keep only the oldest record (by created_at) for each (key, treatment_category, account_id) combination
DELETE FROM treatment_options 
WHERE id::text NOT IN (
  SELECT (array_agg(id ORDER BY created_at ASC))[1]::text
  FROM treatment_options 
  WHERE treatment_category IS NOT NULL
  GROUP BY key, treatment_category, account_id
);
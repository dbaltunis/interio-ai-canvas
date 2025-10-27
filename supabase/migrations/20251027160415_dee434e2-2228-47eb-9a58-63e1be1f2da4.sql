-- Clean up duplicate treatments, keeping only the most recent for each window
DELETE FROM treatments a
USING treatments b
WHERE a.window_id = b.window_id 
  AND a.window_id IS NOT NULL
  AND a.created_at < b.created_at;

-- Add unique constraint on window_id to prevent future duplicates
ALTER TABLE treatments 
DROP CONSTRAINT IF EXISTS treatments_window_id_unique;

ALTER TABLE treatments 
ADD CONSTRAINT treatments_window_id_unique 
UNIQUE (window_id);
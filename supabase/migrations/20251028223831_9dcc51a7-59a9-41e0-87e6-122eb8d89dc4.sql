-- Step 1: Link existing rooms (with NULL quote_id) to their project's first quote version

-- Update existing rooms to link them to the first quote of their project
UPDATE rooms r
SET quote_id = (
  SELECT q.id
  FROM quotes q
  WHERE q.project_id = r.project_id
  ORDER BY q.version ASC NULLS LAST, q.created_at ASC
  LIMIT 1
)
WHERE r.quote_id IS NULL
  AND r.project_id IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM quotes q 
    WHERE q.project_id = r.project_id
  );

-- Update existing treatments to link them to the first quote of their project
UPDATE treatments t
SET quote_id = (
  SELECT q.id
  FROM quotes q
  WHERE q.project_id = t.project_id
  ORDER BY q.version ASC NULLS LAST, q.created_at ASC
  LIMIT 1
)
WHERE t.quote_id IS NULL
  AND t.project_id IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM quotes q 
    WHERE q.project_id = t.project_id
  );
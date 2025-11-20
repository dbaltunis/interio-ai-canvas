
-- Update function to properly detect empty JSON objects and arrays
CREATE OR REPLACE FUNCTION cleanup_orphaned_quote_items()
RETURNS trigger AS $$
BEGIN
  -- Delete quote items with empty or invalid breakdown from the affected project's quotes
  DELETE FROM quote_items
  WHERE quote_id IN (
    SELECT id FROM quotes WHERE project_id = OLD.project_id
  )
  AND (
    breakdown IS NULL
    OR breakdown::text = '{}'
    OR breakdown::text = '[]'
    OR breakdown::text = 'null'
    OR (jsonb_typeof(breakdown) = 'object' AND breakdown = '{}'::jsonb)
    OR (jsonb_typeof(breakdown) = 'array' AND jsonb_array_length(breakdown) = 0)
  );
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- One-time cleanup: Remove ALL existing orphaned quote items with empty breakdown
DELETE FROM quote_items
WHERE (
  breakdown IS NULL
  OR breakdown::text = '{}'
  OR breakdown::text = '[]'
  OR breakdown::text = 'null'
  OR (jsonb_typeof(breakdown) = 'object' AND breakdown = '{}'::jsonb)
  OR (jsonb_typeof(breakdown) = 'array' AND jsonb_array_length(breakdown) = 0)
);

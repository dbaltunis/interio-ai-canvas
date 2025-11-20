
-- Create function to clean up orphaned quote items
CREATE OR REPLACE FUNCTION cleanup_orphaned_quote_items()
RETURNS trigger AS $$
BEGIN
  -- Delete quote items with empty breakdown from the affected project's quotes
  DELETE FROM quote_items
  WHERE quote_id IN (
    SELECT id FROM quotes WHERE project_id = OLD.project_id
  )
  AND (
    breakdown::text = '{}'
    OR breakdown::text = 'null'
    OR breakdown IS NULL
    OR jsonb_array_length(breakdown) = 0
  );
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for treatments deletion
DROP TRIGGER IF EXISTS trigger_cleanup_quote_items_on_treatment_delete ON treatments;
CREATE TRIGGER trigger_cleanup_quote_items_on_treatment_delete
AFTER DELETE ON treatments
FOR EACH ROW
EXECUTE FUNCTION cleanup_orphaned_quote_items();

-- Create trigger for surfaces deletion
DROP TRIGGER IF EXISTS trigger_cleanup_quote_items_on_surface_delete ON surfaces;
CREATE TRIGGER trigger_cleanup_quote_items_on_surface_delete
AFTER DELETE ON surfaces
FOR EACH ROW
EXECUTE FUNCTION cleanup_orphaned_quote_items();

-- One-time cleanup: Remove existing orphaned quote items
DELETE FROM quote_items
WHERE (
  breakdown::text = '{}'
  OR breakdown::text = 'null'
  OR breakdown IS NULL
  OR (jsonb_typeof(breakdown) = 'array' AND jsonb_array_length(breakdown) = 0)
);

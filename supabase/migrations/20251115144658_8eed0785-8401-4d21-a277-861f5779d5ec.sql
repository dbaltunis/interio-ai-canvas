-- Add ordering and visibility control to option_type_categories
ALTER TABLE option_type_categories 
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS hidden_by_user BOOLEAN DEFAULT false;

-- Create index for efficient ordering
CREATE INDEX IF NOT EXISTS idx_option_type_categories_sort_order 
  ON option_type_categories(treatment_category, sort_order, type_label);

-- Set sort_order for existing items based on alphabetical order
WITH ordered_categories AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (PARTITION BY treatment_category ORDER BY type_label) - 1 AS new_sort_order
  FROM option_type_categories
  WHERE sort_order = 0
)
UPDATE option_type_categories otc
SET sort_order = oc.new_sort_order
FROM ordered_categories oc
WHERE otc.id = oc.id;

COMMENT ON COLUMN option_type_categories.sort_order IS 'Display order within treatment category. New items get highest number to appear at end.';
COMMENT ON COLUMN option_type_categories.hidden_by_user IS 'Whether user has hidden this option type from their view. Only affects user-created types.';
-- Backfill missing option_type_categories for existing TWC treatment_options
-- This ensures TWC options appear in Settings → Products → Options

INSERT INTO option_type_categories (account_id, type_key, type_label, treatment_category, sort_order, active)
SELECT DISTINCT
  to2.account_id,
  to2.key,
  to2.label,
  to2.treatment_category,
  COALESCE(to2.order_index, 0),
  true
FROM treatment_options to2
WHERE to2.source = 'twc'
  AND to2.account_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM option_type_categories otc
    WHERE otc.account_id = to2.account_id
      AND otc.type_key = to2.key
      AND otc.treatment_category = to2.treatment_category
  );

-- Also fix any hardware items that were incorrectly categorized
-- Update inventory items with "Tracks Only" or "Track Only" patterns
UPDATE enhanced_inventory_items
SET 
  category = 'hardware',
  subcategory = 'track'
WHERE supplier = 'TWC'
  AND (
    LOWER(name) LIKE '%tracks only%' OR 
    LOWER(name) LIKE '%track only%' OR
    LOWER(name) LIKE '%curtain track%' OR
    (LOWER(name) LIKE '%track%' AND LOWER(name) LIKE '%residential%') OR
    (LOWER(name) LIKE '%track%' AND LOWER(name) LIKE '%designer%')
  )
  AND category != 'hardware';

-- Deactivate any curtain_templates that were created for hardware items
UPDATE curtain_templates
SET active = false
WHERE (
  LOWER(name) LIKE '%tracks only%' OR 
  LOWER(name) LIKE '%track only%' OR
  LOWER(name) LIKE '%curtain track%' OR
  (LOWER(name) LIKE '%track%' AND LOWER(name) LIKE '%residential%') OR
  (LOWER(name) LIKE '%track%' AND LOWER(name) LIKE '%designer%')
);
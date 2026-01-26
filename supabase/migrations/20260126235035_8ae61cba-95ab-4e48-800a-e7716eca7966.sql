-- Delete orphaned option_type_categories that have no matching treatment_options
-- These show as empty tabs in the Options Manager (created by old Dec 2025 migration with generic keys)
DELETE FROM option_type_categories
WHERE id IN (
  SELECT otc.id
  FROM option_type_categories otc
  WHERE NOT EXISTS (
    SELECT 1 FROM treatment_options to2 
    WHERE to2.account_id = otc.account_id 
    AND to2.key = otc.type_key 
    AND to2.treatment_category = otc.treatment_category
  )
);
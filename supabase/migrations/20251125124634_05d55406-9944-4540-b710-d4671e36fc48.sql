
-- Fix system defaults to have hidden_by_user = false
-- User-specific hiding should be tracked in hidden_option_categories table only
UPDATE option_type_categories
SET hidden_by_user = false,
    updated_at = now()
WHERE is_system_default = true
  AND hidden_by_user = true;

-- Verify fix
SELECT 
  treatment_category,
  type_label,
  is_system_default,
  hidden_by_user,
  account_id
FROM option_type_categories
WHERE is_system_default = true
ORDER BY treatment_category, type_label;

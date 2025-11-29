-- Clean up orphan test tabs that don't have matching treatment_options
-- These are leftover test entries that should be removed

DELETE FROM option_type_categories
WHERE account_id = 'b0c727dd-b9bf-4470-840d-1f630e8f2b26'
  AND (
    (type_key = 'test' AND treatment_category = 'wallpaper')
    OR (type_key = 'testing_option' AND treatment_category = 'roller_blinds')
  );
-- Add Hardware option type for curtains as system default
INSERT INTO option_type_categories (
  treatment_category,
  type_key,
  type_label,
  is_system_default,
  active,
  sort_order,
  hidden_by_user
) VALUES (
  'curtains',
  'hardware',
  'Hardware',
  true,
  true,
  2,
  false
) ON CONFLICT DO NOTHING;

-- Update sort orders to maintain proper ordering
UPDATE option_type_categories 
SET sort_order = 1
WHERE treatment_category = 'curtains' AND type_key = 'lining_type';

UPDATE option_type_categories 
SET sort_order = 2
WHERE treatment_category = 'curtains' AND type_key = 'hardware';
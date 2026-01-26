-- Backfill missing option_type_categories for ALL existing TWC treatment_options
-- This makes TWC options visible in Settings → Products → Options

INSERT INTO option_type_categories (
  account_id, 
  type_key, 
  type_label, 
  treatment_category, 
  sort_order, 
  active, 
  hidden_by_user
)
SELECT DISTINCT
  to2.account_id,
  to2.key,
  to2.label,
  to2.treatment_category,
  COALESCE(to2.order_index, 999),
  true,
  false
FROM treatment_options to2
WHERE to2.source = 'twc'
  AND to2.account_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM option_type_categories otc
    WHERE otc.account_id = to2.account_id
      AND otc.type_key = to2.key
      AND otc.treatment_category = to2.treatment_category
  );
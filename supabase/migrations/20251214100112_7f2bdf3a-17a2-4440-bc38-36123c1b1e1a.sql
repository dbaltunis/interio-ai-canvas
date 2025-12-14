-- Phase 1: Clean up orphaned TWC data
-- Delete template_option_settings for orphaned TWC options
DELETE FROM template_option_settings
WHERE treatment_option_id IN (
  SELECT to2.id
  FROM treatment_options to2
  WHERE to2.source = 'twc'
  AND NOT EXISTS (
    SELECT 1 FROM enhanced_inventory_items eii 
    WHERE eii.supplier = 'TWC' 
    AND eii.user_id = to2.account_id
    AND (eii.metadata->>'is_parent_product' = 'true' OR eii.metadata->>'twc_questions' IS NOT NULL)
  )
);

-- Delete option_values for orphaned TWC options
DELETE FROM option_values
WHERE option_id IN (
  SELECT to2.id
  FROM treatment_options to2
  WHERE to2.source = 'twc'
  AND NOT EXISTS (
    SELECT 1 FROM enhanced_inventory_items eii 
    WHERE eii.supplier = 'TWC' 
    AND eii.user_id = to2.account_id
    AND (eii.metadata->>'is_parent_product' = 'true' OR eii.metadata->>'twc_questions' IS NOT NULL)
  )
);

-- Delete orphaned TWC treatment_options (where no TWC parent product exists for this account)
DELETE FROM treatment_options
WHERE source = 'twc'
AND NOT EXISTS (
  SELECT 1 FROM enhanced_inventory_items eii 
  WHERE eii.supplier = 'TWC' 
  AND eii.user_id = treatment_options.account_id
  AND (eii.metadata->>'is_parent_product' = 'true' OR eii.metadata->>'twc_questions' IS NOT NULL)
);

-- Delete orphaned TWC materials (where parent_product_id doesn't exist)
DELETE FROM enhanced_inventory_items
WHERE supplier = 'TWC'
AND metadata->>'parent_product_id' IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM enhanced_inventory_items parent 
  WHERE parent.id::text = enhanced_inventory_items.metadata->>'parent_product_id'
);

-- Delete orphaned TWC templates (where inventory_item_id doesn't exist)
DELETE FROM curtain_templates
WHERE inventory_item_id IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM enhanced_inventory_items eii 
  WHERE eii.id = curtain_templates.inventory_item_id
);
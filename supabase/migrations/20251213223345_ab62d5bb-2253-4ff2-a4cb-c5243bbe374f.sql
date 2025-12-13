-- Phase 2: Clean up orphaned TWC data
-- Find and remove TWC data that no longer has a parent product

-- First, get all valid TWC parent product IDs
WITH valid_parent_ids AS (
  SELECT id 
  FROM enhanced_inventory_items 
  WHERE supplier = 'TWC' 
    AND metadata->'twc_questions' IS NOT NULL
),

-- Find orphaned templates (linked to non-existent inventory items)
orphaned_templates AS (
  SELECT ct.id, ct.name
  FROM curtain_templates ct
  WHERE ct.inventory_item_id IS NOT NULL
    AND ct.description ILIKE '%TWC%'
    AND ct.inventory_item_id NOT IN (SELECT id FROM valid_parent_ids)
),

-- Delete template_option_settings for orphaned templates
deleted_settings AS (
  DELETE FROM template_option_settings
  WHERE template_id IN (SELECT id FROM orphaned_templates)
  RETURNING id
),

-- Delete orphaned templates
deleted_templates AS (
  DELETE FROM curtain_templates
  WHERE id IN (SELECT id FROM orphaned_templates)
  RETURNING id, name
),

-- Find orphaned materials (parent_product_id no longer exists)
orphaned_materials AS (
  SELECT id, name
  FROM enhanced_inventory_items
  WHERE supplier = 'TWC'
    AND metadata->>'parent_product_id' IS NOT NULL
    AND (metadata->>'parent_product_id')::uuid NOT IN (SELECT id FROM valid_parent_ids)
),

-- Delete orphaned materials
deleted_materials AS (
  DELETE FROM enhanced_inventory_items
  WHERE id IN (SELECT id FROM orphaned_materials)
  RETURNING id
),

-- Find TWC options that have no template_option_settings linking them
orphaned_options AS (
  SELECT to_opt.id
  FROM treatment_options to_opt
  WHERE to_opt.source = 'twc'
    AND NOT EXISTS (
      SELECT 1 FROM template_option_settings tos
      WHERE tos.treatment_option_id = to_opt.id
    )
),

-- Delete option_values for orphaned options
deleted_option_values AS (
  DELETE FROM option_values
  WHERE option_id IN (SELECT id FROM orphaned_options)
  RETURNING id
),

-- Delete orphaned options
deleted_options AS (
  DELETE FROM treatment_options
  WHERE id IN (SELECT id FROM orphaned_options)
  RETURNING id
)

-- Return cleanup summary
SELECT 
  (SELECT count(*) FROM deleted_settings) as deleted_template_settings,
  (SELECT count(*) FROM deleted_templates) as deleted_templates,
  (SELECT count(*) FROM deleted_materials) as deleted_materials,
  (SELECT count(*) FROM deleted_option_values) as deleted_option_values,
  (SELECT count(*) FROM deleted_options) as deleted_options;
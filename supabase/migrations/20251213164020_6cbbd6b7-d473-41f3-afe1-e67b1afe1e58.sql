-- Phase 1: Fix TWC Options Source - Reset manually created options
-- The previous migration incorrectly set source='twc' for ALL options including manually created ones

-- Step 1: Reset ALL options to 'manual' source first
UPDATE treatment_options
SET source = 'manual'
WHERE source = 'twc';

-- Step 2: Re-identify genuine TWC options
-- TWC options are those created from TWC sync - they should be linked via template_option_settings
-- to templates that have an inventory_item_id pointing to TWC inventory items

UPDATE treatment_options
SET source = 'twc'
WHERE id IN (
  SELECT DISTINCT tos.treatment_option_id
  FROM template_option_settings tos
  JOIN curtain_templates ct ON ct.id = tos.template_id
  JOIN enhanced_inventory_items eii ON eii.id = ct.inventory_item_id
  WHERE eii.supplier = 'TWC'
);

-- Add comment explaining TWC source tracking
COMMENT ON COLUMN treatment_options.source IS 'Options source: "manual" for user-created, "twc" for TWC-imported. TWC options are identified by template linkage to TWC inventory items.';
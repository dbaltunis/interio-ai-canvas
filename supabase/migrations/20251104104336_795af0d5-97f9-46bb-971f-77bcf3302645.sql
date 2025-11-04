-- Phase 1: Add inventory linking to option_values
ALTER TABLE option_values 
ADD COLUMN IF NOT EXISTS inventory_item_id uuid REFERENCES enhanced_inventory_items(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_option_values_inventory_item ON option_values(inventory_item_id);

COMMENT ON COLUMN option_values.inventory_item_id IS 
'Links option value to inventory item for stock tracking and automatic deduction';

-- Add tracks_inventory flag to treatment_options
ALTER TABLE treatment_options 
ADD COLUMN IF NOT EXISTS tracks_inventory boolean DEFAULT false;

COMMENT ON COLUMN treatment_options.tracks_inventory IS 
'When true, option values should be linked to inventory items for stock tracking';

-- Soft deprecate legacy option_categories tables
ALTER TABLE IF EXISTS option_categories RENAME TO _legacy_option_categories;
ALTER TABLE IF EXISTS option_subcategories RENAME TO _legacy_option_subcategories;
ALTER TABLE IF EXISTS option_sub_subcategories RENAME TO _legacy_option_sub_subcategories;
ALTER TABLE IF EXISTS option_extras RENAME TO _legacy_option_extras;

COMMENT ON TABLE _legacy_option_categories IS 
'DEPRECATED: This hierarchical system is no longer used. Replaced by flat treatment_options system with inventory linking. Data preserved for reference only.';

COMMENT ON TABLE _legacy_option_subcategories IS 
'DEPRECATED: Part of legacy option_categories system. No longer in use.';

COMMENT ON TABLE _legacy_option_sub_subcategories IS 
'DEPRECATED: Part of legacy option_categories system. No longer in use.';

COMMENT ON TABLE _legacy_option_extras IS 
'DEPRECATED: Part of legacy option_categories system. No longer in use.';
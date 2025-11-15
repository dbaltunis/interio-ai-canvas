-- Add inventory linking columns to hierarchical option tables

-- Add columns to _legacy_option_subcategories
ALTER TABLE _legacy_option_subcategories
ADD COLUMN IF NOT EXISTS inventory_item_id UUID REFERENCES enhanced_inventory_items(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS synced_from_inventory BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_sync_date TIMESTAMP WITH TIME ZONE;

-- Add columns to _legacy_option_sub_subcategories
ALTER TABLE _legacy_option_sub_subcategories
ADD COLUMN IF NOT EXISTS inventory_item_id UUID REFERENCES enhanced_inventory_items(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS synced_from_inventory BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_sync_date TIMESTAMP WITH TIME ZONE;

-- Add columns to _legacy_option_extras
ALTER TABLE _legacy_option_extras
ADD COLUMN IF NOT EXISTS inventory_item_id UUID REFERENCES enhanced_inventory_items(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS synced_from_inventory BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_sync_date TIMESTAMP WITH TIME ZONE;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_subcategories_inventory_item ON _legacy_option_subcategories(inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_sub_subcategories_inventory_item ON _legacy_option_sub_subcategories(inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_extras_inventory_item ON _legacy_option_extras(inventory_item_id);

-- Add comments for documentation
COMMENT ON COLUMN _legacy_option_subcategories.inventory_item_id IS 'Links to inventory item for automatic syncing';
COMMENT ON COLUMN _legacy_option_subcategories.synced_from_inventory IS 'Indicates if this was auto-created from inventory';
COMMENT ON COLUMN _legacy_option_subcategories.last_sync_date IS 'Last time inventory data was synced';

COMMENT ON COLUMN _legacy_option_sub_subcategories.inventory_item_id IS 'Links to inventory item for automatic syncing';
COMMENT ON COLUMN _legacy_option_sub_subcategories.synced_from_inventory IS 'Indicates if this was auto-created from inventory';
COMMENT ON COLUMN _legacy_option_sub_subcategories.last_sync_date IS 'Last time inventory data was synced';

COMMENT ON COLUMN _legacy_option_extras.inventory_item_id IS 'Links to inventory item for automatic syncing';
COMMENT ON COLUMN _legacy_option_extras.synced_from_inventory IS 'Indicates if this was auto-created from inventory';
COMMENT ON COLUMN _legacy_option_extras.last_sync_date IS 'Last time inventory data was synced';
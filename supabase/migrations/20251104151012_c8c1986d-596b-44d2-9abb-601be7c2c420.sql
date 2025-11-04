-- Add missing fields for pricing grid integration

-- Add price_group to curtain_templates (system_type already exists)
ALTER TABLE curtain_templates 
ADD COLUMN IF NOT EXISTS price_group TEXT;

-- Add system_type to enhanced_inventory_items (price_group already exists)
ALTER TABLE enhanced_inventory_items 
ADD COLUMN IF NOT EXISTS system_type TEXT;

-- Add comments for documentation
COMMENT ON COLUMN curtain_templates.price_group IS 'Price group for grid routing (e.g., Budget, Standard, Premium)';
COMMENT ON COLUMN curtain_templates.system_type IS 'System type for grid routing (e.g., Cassette, Open Roll, Chain)';
COMMENT ON COLUMN enhanced_inventory_items.price_group IS 'Price group for grid routing (e.g., Budget, Standard, Premium)';
COMMENT ON COLUMN enhanced_inventory_items.system_type IS 'System type for grid routing (e.g., Cassette, Open Roll, Chain)';
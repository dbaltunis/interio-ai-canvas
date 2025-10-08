-- Add treatment_category to curtain_templates
ALTER TABLE curtain_templates 
ADD COLUMN IF NOT EXISTS treatment_category TEXT DEFAULT 'curtains';

-- Add check constraint
ALTER TABLE curtain_templates 
DROP CONSTRAINT IF EXISTS check_treatment_category;

ALTER TABLE curtain_templates 
ADD CONSTRAINT check_treatment_category 
CHECK (treatment_category IN ('curtains', 'roller_blinds', 'roman_blinds', 'venetian_blinds', 'shutters'));

-- Add category to enhanced_inventory_items (if not already present)
-- The enhanced_inventory_items table already has a category field

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_enhanced_inventory_category 
ON enhanced_inventory_items(category) WHERE active = true;

-- Comment for documentation
COMMENT ON COLUMN curtain_templates.treatment_category IS 'Type of window treatment: curtains, roller_blinds, roman_blinds, venetian_blinds, or shutters';
COMMENT ON COLUMN enhanced_inventory_items.category IS 'Inventory category - can be used to filter by treatment type (e.g., curtain_fabric, roller_blind_fabric, blind_fabric, etc.)';

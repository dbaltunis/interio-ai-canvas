-- Add eyelet_ring_ids column to enhanced_inventory_items
ALTER TABLE enhanced_inventory_items
ADD COLUMN IF NOT EXISTS eyelet_ring_ids TEXT[] DEFAULT '{}';

-- Add specifications column for storing heading specs like fullness_ratio
ALTER TABLE enhanced_inventory_items
ADD COLUMN IF NOT EXISTS specifications JSONB DEFAULT '{}';

-- Add metadata column for storing additional data like installation notes
ALTER TABLE enhanced_inventory_items
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Update existing heading items from components_temp if any exist
-- This migrates old heading data to the new structure
DO $$
DECLARE
  heading_record RECORD;
  new_inventory_id UUID;
BEGIN
  FOR heading_record IN 
    SELECT * FROM components_temp WHERE component_type = 'heading'
  LOOP
    -- Insert into enhanced_inventory_items
    INSERT INTO enhanced_inventory_items (
      user_id,
      name,
      description,
      category,
      subcategory,
      cost_price,
      selling_price,
      fullness_ratio,
      active,
      created_at,
      updated_at
    ) VALUES (
      heading_record.user_id,
      heading_record.name,
      heading_record.description,
      'heading',
      COALESCE(heading_record.component_type, 'custom_heading'),
      heading_record.cost_price,
      heading_record.selling_price,
      COALESCE(heading_record.fullness_ratio, 2.0),
      heading_record.active,
      heading_record.created_at,
      heading_record.updated_at
    ) RETURNING id INTO new_inventory_id;
    
    -- Log the migration
    RAISE NOTICE 'Migrated heading: % (ID: % -> %)', heading_record.name, heading_record.id, new_inventory_id;
  END LOOP;
END $$;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_enhanced_inventory_category ON enhanced_inventory_items(category);
CREATE INDEX IF NOT EXISTS idx_enhanced_inventory_user_category ON enhanced_inventory_items(user_id, category);
CREATE INDEX IF NOT EXISTS idx_eyelet_rings_user ON eyelet_rings(user_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_type ON product_variants(variant_type, user_id);
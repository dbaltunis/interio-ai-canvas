-- Add inventory_item_id column to curtain_templates for TWC product linking
ALTER TABLE curtain_templates 
ADD COLUMN IF NOT EXISTS inventory_item_id UUID REFERENCES enhanced_inventory_items(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_curtain_templates_inventory_item_id 
ON curtain_templates(inventory_item_id) WHERE inventory_item_id IS NOT NULL;

-- Clean up duplicate TWC products (keep oldest, remove duplicates)
WITH duplicates AS (
  SELECT id, name, sku,
    ROW_NUMBER() OVER (PARTITION BY sku ORDER BY created_at ASC) as rn
  FROM enhanced_inventory_items
  WHERE supplier = 'TWC'
)
DELETE FROM enhanced_inventory_items 
WHERE id IN (SELECT id FROM duplicates WHERE rn > 1);

-- Update existing TWC products with correct treatment_category based on description
UPDATE enhanced_inventory_items
SET subcategory = CASE
  WHEN LOWER(description) LIKE '%aluminium%' OR LOWER(description) LIKE '%venetian%' OR LOWER(description) LIKE '%slat%' THEN 'venetian_slats'
  WHEN LOWER(description) LIKE '%roller%' THEN 'roller_fabric'
  WHEN LOWER(description) LIKE '%vertical%' THEN 'vertical_slats'
  WHEN LOWER(description) LIKE '%cellular%' OR LOWER(description) LIKE '%honeycomb%' THEN 'cellular'
  WHEN LOWER(description) LIKE '%roman%' THEN 'roman_fabric'
  WHEN LOWER(description) LIKE '%shutter%' THEN 'shutter_material'
  ELSE subcategory
END
WHERE supplier = 'TWC';

-- Link existing curtain_templates to their inventory items by matching name
UPDATE curtain_templates ct
SET inventory_item_id = eii.id
FROM enhanced_inventory_items eii
WHERE ct.name = eii.name
AND eii.supplier = 'TWC'
AND ct.inventory_item_id IS NULL;
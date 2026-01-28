-- Add auto_select_first_option setting to curtain_templates
ALTER TABLE curtain_templates 
ADD COLUMN IF NOT EXISTS auto_select_first_option boolean DEFAULT false;

-- Enable for all TWC templates by default
UPDATE curtain_templates ct
SET auto_select_first_option = true
FROM enhanced_inventory_items eii
WHERE ct.inventory_item_id = eii.id
  AND eii.supplier = 'TWC';
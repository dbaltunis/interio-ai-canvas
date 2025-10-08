-- Update existing fabric items to be roller blind fabrics
UPDATE enhanced_inventory_items
SET category = 'roller_blind_fabric'
WHERE id IN (
  SELECT id FROM enhanced_inventory_items
  WHERE category = 'curtain_fabric'
    AND active = true
  LIMIT 5
);

-- Update the existing 'roller' template to have correct treatment category
UPDATE curtain_templates
SET treatment_category = 'roller_blinds'
WHERE name = 'roller' AND active = true;
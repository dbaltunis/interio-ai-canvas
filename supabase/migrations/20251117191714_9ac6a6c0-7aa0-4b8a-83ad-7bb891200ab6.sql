
-- Bulk assign curtain template to all curtain fabrics in store
UPDATE store_product_visibility
SET 
  template_id = 'd31311e0-537b-47f0-8558-8ef00476c090', -- Curtains template with fullness 2.5
  updated_at = now()
WHERE id IN (
  SELECT spv.id
  FROM store_product_visibility spv
  JOIN enhanced_inventory_items ei ON spv.inventory_item_id = ei.id
  WHERE spv.is_visible = true
    AND spv.template_id IS NULL
    AND ei.subcategory = 'curtain_fabric'
);

-- Bulk assign roller blind template to all roller fabrics in store
UPDATE store_product_visibility
SET 
  template_id = 'ad3eec2d-8ec1-4b02-8c84-4aa862d4e0a7', -- External Screen - Standard roller template
  updated_at = now()
WHERE id IN (
  SELECT spv.id
  FROM store_product_visibility spv
  JOIN enhanced_inventory_items ei ON spv.inventory_item_id = ei.id
  WHERE spv.is_visible = true
    AND spv.template_id IS NULL
    AND ei.subcategory = 'roller_fabric'
);

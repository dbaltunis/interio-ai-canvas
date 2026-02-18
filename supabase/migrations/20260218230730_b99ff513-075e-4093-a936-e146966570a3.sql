-- Deduplicate existing quote_items across ALL quotes
-- Keep only ONE item per unique (quote_id, name, room_name, surface_name, unit_price) combo
-- This cleans up the 37-item duplication bug caused by FK crash + re-sync loops

DELETE FROM quote_items
WHERE id NOT IN (
  SELECT DISTINCT ON (
    quote_id, 
    name, 
    product_details->>'room_name', 
    product_details->>'surface_name',
    unit_price::text
  ) id
  FROM quote_items
  ORDER BY 
    quote_id, 
    name, 
    product_details->>'room_name', 
    product_details->>'surface_name',
    unit_price::text,
    created_at ASC
);

-- Also backfill vendor_id from windows_summary fabric_details/material_details
-- into quote_items product_details for supplier detection
UPDATE quote_items qi
SET product_details = jsonb_set(
  COALESCE(qi.product_details::jsonb, '{}'::jsonb),
  '{vendor_id}',
  to_jsonb(eii.vendor_id::text)
)
FROM quotes q
JOIN projects p ON p.id = q.project_id
JOIN surfaces s ON s.project_id = p.id
JOIN windows_summary ws ON ws.window_id = s.id
JOIN enhanced_inventory_items eii ON eii.id = (ws.fabric_details->>'id')::uuid
WHERE qi.quote_id = q.id
  AND eii.vendor_id IS NOT NULL
  AND (qi.product_details->>'vendor_id') IS NULL
  AND ws.fabric_details->>'id' IS NOT NULL;

-- Same for material_details
UPDATE quote_items qi
SET product_details = jsonb_set(
  COALESCE(qi.product_details::jsonb, '{}'::jsonb),
  '{vendor_id}',
  to_jsonb(eii.vendor_id::text)
)
FROM quotes q
JOIN projects p ON p.id = q.project_id
JOIN surfaces s ON s.project_id = p.id
JOIN windows_summary ws ON ws.window_id = s.id
JOIN enhanced_inventory_items eii ON eii.id = (ws.material_details->>'id')::uuid
WHERE qi.quote_id = q.id
  AND eii.vendor_id IS NOT NULL
  AND (qi.product_details->>'vendor_id') IS NULL
  AND ws.material_details->>'id' IS NOT NULL;
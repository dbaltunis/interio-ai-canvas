
-- Backfill quote_items.inventory_item_id from windows_summary
-- Fix: Use subquery instead of multi-table UPDATE with self-referencing join
UPDATE quote_items
SET inventory_item_id = sub.inv_id
FROM (
  SELECT qi.id as qi_id, COALESCE(ws.selected_fabric_id, ws.selected_material_id) as inv_id
  FROM quote_items qi
  JOIN quotes q ON qi.quote_id = q.id
  JOIN treatments t ON q.project_id = t.project_id AND qi.name = t.product_name
  JOIN windows_summary ws ON ws.window_id = t.window_id
  WHERE qi.inventory_item_id IS NULL
    AND (ws.selected_fabric_id IS NOT NULL OR ws.selected_material_id IS NOT NULL)
) sub
WHERE quote_items.id = sub.qi_id;

-- Backfill quote_items product_details.vendor_id from inventory
UPDATE quote_items
SET product_details = jsonb_set(
  COALESCE(product_details::jsonb, '{}'::jsonb),
  '{vendor_id}',
  to_jsonb(eii.vendor_id::text)
)
FROM enhanced_inventory_items eii
WHERE quote_items.inventory_item_id = eii.id
  AND eii.vendor_id IS NOT NULL
  AND (quote_items.product_details->>'vendor_id') IS NULL;

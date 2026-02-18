-- Backfill vendor_id in windows_summary.fabric_details using fabric_details->>'id'
UPDATE windows_summary ws
SET fabric_details = jsonb_set(
  ws.fabric_details::jsonb,
  '{vendor_id}',
  to_jsonb(eii.vendor_id::text)
)
FROM enhanced_inventory_items eii
WHERE ws.fabric_details IS NOT NULL
  AND (ws.fabric_details->>'id') IS NOT NULL
  AND (ws.fabric_details->>'id')::uuid = eii.id
  AND eii.vendor_id IS NOT NULL
  AND (ws.fabric_details->>'vendor_id') IS NULL;

-- Backfill vendor_id in windows_summary.material_details using material_details->>'id'
UPDATE windows_summary ws
SET material_details = jsonb_set(
  ws.material_details::jsonb,
  '{vendor_id}',
  to_jsonb(eii.vendor_id::text)
)
FROM enhanced_inventory_items eii
WHERE ws.material_details IS NOT NULL
  AND (ws.material_details->>'id') IS NOT NULL
  AND (ws.material_details->>'id')::uuid = eii.id
  AND eii.vendor_id IS NOT NULL
  AND (ws.material_details->>'vendor_id') IS NULL;

-- Backfill vendor_id in quote_items.product_details from windows_summary
-- Join through quotes -> projects -> surfaces -> windows_summary -> enhanced_inventory_items
UPDATE quote_items qi
SET product_details = jsonb_set(
  COALESCE(qi.product_details::jsonb, '{}'::jsonb),
  '{vendor_id}',
  to_jsonb(eii.vendor_id::text)
)
FROM quotes q
JOIN projects p ON q.project_id = p.id
JOIN surfaces s ON s.project_id = p.id
JOIN windows_summary ws ON ws.window_id = s.id
JOIN enhanced_inventory_items eii ON eii.id = COALESCE(
  CASE WHEN ws.fabric_details IS NOT NULL AND (ws.fabric_details->>'id') IS NOT NULL 
       THEN (ws.fabric_details->>'id')::uuid END,
  CASE WHEN ws.material_details IS NOT NULL AND (ws.material_details->>'id') IS NOT NULL 
       THEN (ws.material_details->>'id')::uuid END
)
WHERE qi.quote_id = q.id
  AND eii.vendor_id IS NOT NULL
  AND (qi.product_details IS NULL OR (qi.product_details->>'vendor_id') IS NULL);

-- Also backfill inventory_item_id in quote_items.product_details
UPDATE quote_items qi
SET product_details = jsonb_set(
  COALESCE(qi.product_details::jsonb, '{}'::jsonb),
  '{inventory_item_id}',
  to_jsonb(eii.id::text)
)
FROM quotes q
JOIN projects p ON q.project_id = p.id
JOIN surfaces s ON s.project_id = p.id
JOIN windows_summary ws ON ws.window_id = s.id
JOIN enhanced_inventory_items eii ON eii.id = COALESCE(
  CASE WHEN ws.fabric_details IS NOT NULL AND (ws.fabric_details->>'id') IS NOT NULL 
       THEN (ws.fabric_details->>'id')::uuid END,
  CASE WHEN ws.material_details IS NOT NULL AND (ws.material_details->>'id') IS NOT NULL 
       THEN (ws.material_details->>'id')::uuid END
)
WHERE qi.quote_id = q.id
  AND (qi.product_details IS NULL OR (qi.product_details->>'inventory_item_id') IS NULL);
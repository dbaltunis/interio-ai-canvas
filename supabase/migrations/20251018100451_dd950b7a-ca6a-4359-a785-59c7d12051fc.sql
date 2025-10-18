
-- Backfill treatments from windows_summary (simplified)
INSERT INTO treatments (
  user_id, project_id, room_id, window_id, treatment_type, product_name, quantity,
  fabric_details, treatment_details, total_price, material_cost, labor_cost, notes
)
SELECT 
  s.user_id, s.project_id, s.room_id, s.id,
  ws.treatment_type,
  COALESCE(ws.template_name, 'Treatment'),
  1,
  CASE WHEN ws.selected_fabric_id IS NOT NULL THEN
    jsonb_build_object('fabricId', ws.selected_fabric_id, 'fabric_id', ws.selected_fabric_id, 'id', ws.selected_fabric_id)
  ELSE NULL END,
  jsonb_build_object('material_id', ws.selected_material_id, 'materialId', ws.selected_material_id, 'hardware_id', ws.selected_hardware_id, 'hardwareId', ws.selected_hardware_id),
  COALESCE(ws.total_cost, 0),
  COALESCE(ws.fabric_cost, 0),
  COALESCE(ws.manufacturing_cost, 0),
  'Backfilled'
FROM surfaces s
INNER JOIN windows_summary ws ON ws.window_id = s.id
WHERE s.project_id = '0218bf44-ecb9-4917-87e1-17c9a4f90f0a'
  AND NOT EXISTS (SELECT 1 FROM treatments t WHERE t.window_id = s.id);

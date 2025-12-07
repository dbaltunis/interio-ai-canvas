-- Link TWC options to the template (create template_option_settings with is_enabled=true)
INSERT INTO template_option_settings (template_id, treatment_option_id, is_enabled)
SELECT 
  'a6b6ed6c-e62a-42b7-8283-ae63941e0fec', -- template_id
  to2.id,
  true
FROM treatment_options to2
WHERE to2.account_id = 'b0c727dd-b9bf-4470-840d-1f630e8f2b26'
  AND to2.treatment_category = 'venetian_blinds'
  AND to2.key IN ('control_type', 'control_length', 'fixing', 'cutout', 'mixed_slats', 'between_glass', 'hold_down_clips')
  AND NOT EXISTS (
    SELECT 1 FROM template_option_settings tos 
    WHERE tos.template_id = 'a6b6ed6c-e62a-42b7-8283-ae63941e0fec'
    AND tos.treatment_option_id = to2.id
  )
ON CONFLICT DO NOTHING;
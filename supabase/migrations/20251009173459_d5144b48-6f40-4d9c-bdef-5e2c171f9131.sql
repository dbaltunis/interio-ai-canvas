-- Delete old cloned templates that don't have complete options
DELETE FROM curtain_templates 
WHERE is_system_default = false 
AND name LIKE '%(Custom)%'
AND (
  SELECT COUNT(*) FROM treatment_options WHERE treatment_id = curtain_templates.id
) < 6;
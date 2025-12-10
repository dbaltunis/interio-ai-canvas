-- Fix templates with invalid selected_heading_ids (pointing to non-existent or wrong-account headings)
-- Set to all valid headings from the user's own account

UPDATE curtain_templates ct
SET selected_heading_ids = (
  SELECT COALESCE(array_agg(eii.id), ARRAY[]::uuid[])
  FROM enhanced_inventory_items eii
  WHERE eii.user_id = ct.user_id
    AND eii.category = 'heading'
    AND eii.active = true
)
WHERE ct.treatment_category IN ('curtains', 'roman_blinds')
  AND ct.active = true;
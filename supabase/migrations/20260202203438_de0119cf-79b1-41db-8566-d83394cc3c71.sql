-- Copy options from working "Verticals" template to "Verticals (Slats Only)" template
-- This ensures the broken template has all the same TWC options as the working one

INSERT INTO template_option_settings (template_id, treatment_option_id, is_enabled, order_index)
SELECT 
  'a6ab02d7-cac3-4f31-87d8-6046eb65f597'::uuid, -- Target: Verticals (Slats Only)
  treatment_option_id,
  is_enabled,
  order_index
FROM template_option_settings
WHERE template_id = 'ccc26823-36ae-4dfe-9c22-6bb9851e45ca'::uuid -- Source: Working Verticals
ON CONFLICT (template_id, treatment_option_id) DO NOTHING;
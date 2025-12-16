-- Link curtain options to curtain template
INSERT INTO template_option_settings (template_id, treatment_option_id, is_enabled)
SELECT ct.id, to_opt.id, true
FROM curtain_templates ct
CROSS JOIN treatment_options to_opt
WHERE ct.user_id = '708d8e36-8fa3-4e07-b43b-c0a90941f991'
  AND ct.name = 'Homekaara Curtains'
  AND to_opt.account_id = '708d8e36-8fa3-4e07-b43b-c0a90941f991'
  AND to_opt.treatment_category = 'curtains'
ON CONFLICT (template_id, treatment_option_id) DO NOTHING;

-- Link roman blind options to roman blind template
INSERT INTO template_option_settings (template_id, treatment_option_id, is_enabled)
SELECT ct.id, to_opt.id, true
FROM curtain_templates ct
CROSS JOIN treatment_options to_opt
WHERE ct.user_id = '708d8e36-8fa3-4e07-b43b-c0a90941f991'
  AND ct.name = 'Homekaara Roman Blinds'
  AND to_opt.account_id = '708d8e36-8fa3-4e07-b43b-c0a90941f991'
  AND to_opt.treatment_category = 'roman_blinds'
ON CONFLICT (template_id, treatment_option_id) DO NOTHING;

-- Link roller blind options to both roller templates
INSERT INTO template_option_settings (template_id, treatment_option_id, is_enabled)
SELECT ct.id, to_opt.id, true
FROM curtain_templates ct
CROSS JOIN treatment_options to_opt
WHERE ct.user_id = '708d8e36-8fa3-4e07-b43b-c0a90941f991'
  AND ct.name IN ('Homekaara Roller Blinds', 'Homekaara Zebra/Dual Blinds')
  AND to_opt.account_id = '708d8e36-8fa3-4e07-b43b-c0a90941f991'
  AND to_opt.treatment_category = 'roller_blinds'
ON CONFLICT (template_id, treatment_option_id) DO NOTHING;
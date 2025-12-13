-- Enable all options linked to the Roller Blinds TWC template
UPDATE template_option_settings
SET is_enabled = true
WHERE template_id = 'ea42d882-56dc-409e-8b7c-b1bc9d87f291';

-- Also enable the venetian TWC options (newly migrated ones)
UPDATE template_option_settings tos
SET is_enabled = true
FROM treatment_options to2
WHERE tos.treatment_option_id = to2.id
  AND to2.source = 'twc'
  AND to2.account_id = 'ec930f73-ef23-4430-921f-1b401859825d';
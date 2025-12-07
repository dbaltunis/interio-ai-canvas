-- Fix existing TWC template_option_settings that were created with is_enabled: false
UPDATE template_option_settings 
SET is_enabled = true, updated_at = now()
WHERE template_id = 'a6b6ed6c-e62a-42b7-8283-ae63941e0fec'
  AND is_enabled = false;
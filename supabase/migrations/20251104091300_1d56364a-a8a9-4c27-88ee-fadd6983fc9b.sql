-- Reactivate all system default templates
UPDATE curtain_templates 
SET active = true 
WHERE is_system_default = true;
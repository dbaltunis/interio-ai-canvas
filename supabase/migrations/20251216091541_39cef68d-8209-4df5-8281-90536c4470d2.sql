-- Add unique constraint for template_option_settings upsert
ALTER TABLE template_option_settings 
DROP CONSTRAINT IF EXISTS template_option_settings_template_option_unique;

ALTER TABLE template_option_settings 
ADD CONSTRAINT template_option_settings_template_option_unique 
UNIQUE (template_id, treatment_option_id);
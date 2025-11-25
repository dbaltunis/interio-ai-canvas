-- Fix the foreign key to point to curtain_templates instead of product_templates
ALTER TABLE template_option_settings 
DROP CONSTRAINT IF EXISTS template_option_settings_template_id_fkey;

ALTER TABLE template_option_settings 
ADD CONSTRAINT template_option_settings_template_id_fkey 
FOREIGN KEY (template_id) 
REFERENCES curtain_templates(id) 
ON DELETE CASCADE;
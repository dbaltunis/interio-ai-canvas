-- Make heading_name nullable since the form uses selected_heading_ids now
ALTER TABLE curtain_templates 
ALTER COLUMN heading_name DROP NOT NULL;

-- Add default value for backward compatibility
ALTER TABLE curtain_templates 
ALTER COLUMN heading_name SET DEFAULT 'Standard';
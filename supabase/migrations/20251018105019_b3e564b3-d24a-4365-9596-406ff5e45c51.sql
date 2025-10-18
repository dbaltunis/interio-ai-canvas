-- Fix option_rules to reference curtain_templates instead of treatments
-- This allows rules to be set on templates, not individual treatment instances

-- Drop the existing foreign key constraint
ALTER TABLE option_rules 
DROP CONSTRAINT IF EXISTS option_rules_treatment_id_fkey;

-- Rename the column to be more clear
ALTER TABLE option_rules 
RENAME COLUMN treatment_id TO template_id;

-- Add the new foreign key constraint to curtain_templates
ALTER TABLE option_rules 
ADD CONSTRAINT option_rules_template_id_fkey 
FOREIGN KEY (template_id) 
REFERENCES curtain_templates(id) 
ON DELETE CASCADE;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_option_rules_template_id 
ON option_rules(template_id);
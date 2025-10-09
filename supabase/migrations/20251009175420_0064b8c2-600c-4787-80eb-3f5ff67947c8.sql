-- Fix the incorrect unique constraint on treatment_options table
-- The constraint is using treatment_id (which doesn't exist) instead of template_id

-- Drop the incorrect constraint
ALTER TABLE treatment_options DROP CONSTRAINT IF EXISTS treatment_options_treatment_id_key_key;

-- Add the correct unique constraint on template_id and key
ALTER TABLE treatment_options DROP CONSTRAINT IF EXISTS treatment_options_template_id_key_key;
ALTER TABLE treatment_options 
  ADD CONSTRAINT treatment_options_template_id_key_key UNIQUE (template_id, key);
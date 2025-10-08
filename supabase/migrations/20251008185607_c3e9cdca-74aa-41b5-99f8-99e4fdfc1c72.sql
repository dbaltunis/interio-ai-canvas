-- Add panel_configuration field to curtain_templates table
-- This allows having "Curtain" as a type with "single" or "pair" as a separate option

ALTER TABLE curtain_templates 
ADD COLUMN panel_configuration text DEFAULT 'pair' CHECK (panel_configuration IN ('single', 'pair'));

-- Migrate existing data: copy curtain_type values to panel_configuration for curtain entries
UPDATE curtain_templates 
SET panel_configuration = curtain_type 
WHERE curtain_type IN ('single', 'pair');

-- Update curtain_type to 'curtain' for all single/pair entries
UPDATE curtain_templates 
SET curtain_type = 'curtain'
WHERE curtain_type IN ('single', 'pair');
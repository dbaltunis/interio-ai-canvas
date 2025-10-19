-- Add waste_percent column to curtain_templates if it doesn't exist
ALTER TABLE curtain_templates 
ADD COLUMN IF NOT EXISTS waste_percent numeric DEFAULT 5;
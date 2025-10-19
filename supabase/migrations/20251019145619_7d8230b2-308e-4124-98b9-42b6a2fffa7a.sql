-- Add blind/shutter specific manufacturing settings to curtain_templates
ALTER TABLE curtain_templates 
ADD COLUMN IF NOT EXISTS bracket_deduction numeric,
ADD COLUMN IF NOT EXISTS minimum_width numeric,
ADD COLUMN IF NOT EXISTS maximum_width numeric,
ADD COLUMN IF NOT EXISTS minimum_height numeric,
ADD COLUMN IF NOT EXISTS maximum_height numeric,
ADD COLUMN IF NOT EXISTS stack_allowance numeric;
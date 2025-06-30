
-- Add measurement_units column to business_settings table
ALTER TABLE business_settings ADD COLUMN IF NOT EXISTS measurement_units TEXT;

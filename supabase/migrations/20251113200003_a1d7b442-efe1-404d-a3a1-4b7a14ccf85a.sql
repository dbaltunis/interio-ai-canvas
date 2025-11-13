-- Add notes column to surfaces table for item-specific notes
ALTER TABLE surfaces 
ADD COLUMN IF NOT EXISTS notes TEXT;
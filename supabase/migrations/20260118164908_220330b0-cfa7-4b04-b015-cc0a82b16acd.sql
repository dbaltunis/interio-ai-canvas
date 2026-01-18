-- Add excluded_items column to quotes table for storing items excluded from documents
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS excluded_items TEXT[] DEFAULT '{}';
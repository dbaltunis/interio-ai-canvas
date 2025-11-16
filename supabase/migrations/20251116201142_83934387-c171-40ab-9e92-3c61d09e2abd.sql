-- Add tags column to enhanced_inventory_items table
ALTER TABLE enhanced_inventory_items 
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

-- Add index for tags array for better performance
CREATE INDEX IF NOT EXISTS idx_enhanced_inventory_tags ON enhanced_inventory_items USING GIN (tags);

-- Update RLS policies to include tags
-- (existing policies will automatically work with the new column)
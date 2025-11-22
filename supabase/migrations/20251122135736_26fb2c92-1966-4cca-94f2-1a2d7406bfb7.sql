-- Add inventory_item_id column to quote_items table for inventory tracking
-- This column will link quote items directly to inventory items for easier deduction
-- Made nullable to maintain backward compatibility with existing quotes

ALTER TABLE quote_items 
ADD COLUMN IF NOT EXISTS inventory_item_id uuid REFERENCES enhanced_inventory_items(id) ON DELETE SET NULL;

-- Add index for faster lookups during inventory deduction
CREATE INDEX IF NOT EXISTS idx_quote_items_inventory_item_id ON quote_items(inventory_item_id);

-- Add comment to document the purpose
COMMENT ON COLUMN quote_items.inventory_item_id IS 'Links to the primary inventory item (fabric/material) used in this quote item. Used for automatic inventory deduction when project status changes.';
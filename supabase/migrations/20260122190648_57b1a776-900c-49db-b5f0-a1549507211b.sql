-- Add item_filter column to work_order_share_links for specific item ID filtering
ALTER TABLE work_order_share_links 
ADD COLUMN IF NOT EXISTS item_filter UUID[] DEFAULT '{}';

-- Add comment explaining the column
COMMENT ON COLUMN work_order_share_links.item_filter IS 'Array of specific workshop_item UUIDs to include in share. Empty array means all items.';
-- Add orientation column to work_order_share_links
ALTER TABLE work_order_share_links 
ADD COLUMN IF NOT EXISTS orientation TEXT DEFAULT 'landscape';

-- Update existing links to use landscape (the app default)
UPDATE work_order_share_links 
SET orientation = 'landscape' 
WHERE orientation IS NULL;
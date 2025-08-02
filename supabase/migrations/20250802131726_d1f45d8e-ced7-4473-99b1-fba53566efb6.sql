-- Add selected_heading_ids column to curtain_templates table
ALTER TABLE public.curtain_templates 
ADD COLUMN selected_heading_ids UUID[] DEFAULT '{}';

-- Add comment to explain the column
COMMENT ON COLUMN public.curtain_templates.selected_heading_ids IS 'Array of heading style IDs from enhanced_inventory_items that are available in this template';
-- Add compatible_treatments column to enhanced_inventory_items
-- This stores which treatment types an inventory item can be used with

ALTER TABLE public.enhanced_inventory_items 
ADD COLUMN IF NOT EXISTS compatible_treatments text[] DEFAULT '{}';

-- Add index for filtering by compatible treatments
CREATE INDEX IF NOT EXISTS idx_inventory_compatible_treatments 
ON public.enhanced_inventory_items USING GIN (compatible_treatments);

-- Comment explaining the column
COMMENT ON COLUMN public.enhanced_inventory_items.compatible_treatments IS 
'Array of treatment types this inventory item is compatible with (e.g., ["curtains", "roman_blinds"]). Used for filtering inventory in worksheets.';
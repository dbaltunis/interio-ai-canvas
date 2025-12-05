-- Add price_per_sqm column to enhanced_inventory_items if it doesn't exist
ALTER TABLE public.enhanced_inventory_items 
ADD COLUMN IF NOT EXISTS price_per_sqm numeric DEFAULT NULL;
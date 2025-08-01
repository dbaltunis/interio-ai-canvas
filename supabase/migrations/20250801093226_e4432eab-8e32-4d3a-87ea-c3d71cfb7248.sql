
-- Add vendor_id column to enhanced_inventory_items table
ALTER TABLE public.enhanced_inventory_items 
ADD COLUMN vendor_id uuid REFERENCES public.vendors(id);

-- Create index for better performance on vendor queries
CREATE INDEX idx_enhanced_inventory_items_vendor_id 
ON public.enhanced_inventory_items(vendor_id);

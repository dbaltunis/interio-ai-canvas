-- Add vendor cost visibility settings to business_settings table
ALTER TABLE public.business_settings 
ADD COLUMN IF NOT EXISTS show_vendor_costs_to_managers BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS show_vendor_costs_to_staff BOOLEAN DEFAULT false;

-- Add comments for documentation
COMMENT ON COLUMN public.business_settings.show_vendor_costs_to_managers IS 'Allow managers to view vendor cost prices';
COMMENT ON COLUMN public.business_settings.show_vendor_costs_to_staff IS 'Allow staff members to view vendor cost prices';
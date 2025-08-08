-- Add detailed breakdown columns to windows_summary table
ALTER TABLE public.windows_summary ADD COLUMN IF NOT EXISTS template_name text;
ALTER TABLE public.windows_summary ADD COLUMN IF NOT EXISTS template_details jsonb DEFAULT '{}';
ALTER TABLE public.windows_summary ADD COLUMN IF NOT EXISTS fabric_details jsonb DEFAULT '{}';
ALTER TABLE public.windows_summary ADD COLUMN IF NOT EXISTS lining_details jsonb DEFAULT '{}';
ALTER TABLE public.windows_summary ADD COLUMN IF NOT EXISTS heading_details jsonb DEFAULT '{}';
ALTER TABLE public.windows_summary ADD COLUMN IF NOT EXISTS extras_details jsonb DEFAULT '[]';
ALTER TABLE public.windows_summary ADD COLUMN IF NOT EXISTS cost_breakdown jsonb DEFAULT '[]';
ALTER TABLE public.windows_summary ADD COLUMN IF NOT EXISTS measurements_details jsonb DEFAULT '{}';

-- Add comment for clarity
COMMENT ON COLUMN public.windows_summary.template_details IS 'Stores template information including name, type, and pricing details';
COMMENT ON COLUMN public.windows_summary.fabric_details IS 'Stores fabric details: name, price_per_meter, meters_used, total_cost, width, etc.';
COMMENT ON COLUMN public.windows_summary.lining_details IS 'Stores lining details: type, price_per_meter, meters_used, total_cost';
COMMENT ON COLUMN public.windows_summary.heading_details IS 'Stores heading information: type, cost, description';
COMMENT ON COLUMN public.windows_summary.extras_details IS 'Array of additional items with name, quantity, unit_price, total_cost';
COMMENT ON COLUMN public.windows_summary.cost_breakdown IS 'Itemized cost breakdown for display in cards';
COMMENT ON COLUMN public.windows_summary.measurements_details IS 'Stores measurement details for reference: dimensions, hems, fullness, etc.';
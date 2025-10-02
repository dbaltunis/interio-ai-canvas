-- Add allow_in_app_template_editing column to business_settings
ALTER TABLE public.business_settings 
ADD COLUMN IF NOT EXISTS allow_in_app_template_editing boolean DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN public.business_settings.allow_in_app_template_editing IS 'Allows staff to edit templates directly in the app (admin-only setting)';

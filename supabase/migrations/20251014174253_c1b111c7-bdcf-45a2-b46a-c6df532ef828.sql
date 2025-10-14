-- Add image_url column to curtain_templates table
ALTER TABLE public.curtain_templates 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_curtain_templates_image_url 
ON public.curtain_templates(image_url) 
WHERE image_url IS NOT NULL;

COMMENT ON COLUMN public.curtain_templates.image_url IS 'URL or base64 data for product template image to display in rooms and quotes';
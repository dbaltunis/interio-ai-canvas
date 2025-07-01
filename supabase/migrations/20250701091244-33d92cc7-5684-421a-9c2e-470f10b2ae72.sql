
-- Add image_url column to window_covering_option_categories if it doesn't exist
ALTER TABLE public.window_covering_option_categories 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add image_url column to window_covering_option_subcategories if it doesn't exist
ALTER TABLE public.window_covering_option_subcategories 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add image_url column to window_covering_options if it doesn't exist
ALTER TABLE public.window_covering_options 
ADD COLUMN IF NOT EXISTS image_url TEXT;

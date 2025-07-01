
-- Add image_url column to window_covering_option_categories
ALTER TABLE public.window_covering_option_categories 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add image_url column to window_covering_option_subcategories  
ALTER TABLE public.window_covering_option_subcategories 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add image_url column to window_covering_options for consistency
ALTER TABLE public.window_covering_options 
ADD COLUMN IF NOT EXISTS image_url TEXT;

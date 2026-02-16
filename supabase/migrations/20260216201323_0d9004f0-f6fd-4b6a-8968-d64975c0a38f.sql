-- Add color_tag column to collections table
ALTER TABLE public.collections ADD COLUMN IF NOT EXISTS color_tag text;

-- Add color_tag column to vendors table
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS color_tag text;
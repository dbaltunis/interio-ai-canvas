-- Drop the problematic index on image_url
-- Base64 images are too large to be indexed (can exceed 8KB limit)
DROP INDEX IF EXISTS public.idx_curtain_templates_image_url;

-- The image_url column will remain but won't be indexed
-- This is fine since we don't need to search by image data
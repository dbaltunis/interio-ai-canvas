-- Fix the SECURITY DEFINER issue on the public_store_info view
-- Recreate the view with SECURITY INVOKER (default, safer)
DROP VIEW IF EXISTS public_store_info;

CREATE VIEW public_store_info 
WITH (security_invoker = true) AS
SELECT 
  id,
  store_name,
  store_slug,
  logo_url,
  primary_color,
  secondary_color,
  accent_color,
  font_family,
  template_id,
  seo_title,
  seo_description,
  is_published,
  created_at,
  updated_at
FROM online_stores
WHERE is_published = true;

-- Grant access to the view
GRANT SELECT ON public_store_info TO anon;
GRANT SELECT ON public_store_info TO authenticated;
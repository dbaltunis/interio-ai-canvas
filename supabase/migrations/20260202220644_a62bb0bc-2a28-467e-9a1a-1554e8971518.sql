-- Drop and recreate the get_public_scheduler function with business settings
DROP FUNCTION IF EXISTS public.get_public_scheduler(text);

CREATE OR REPLACE FUNCTION public.get_public_scheduler(slug_param text)
RETURNS TABLE (
  id uuid,
  slug text,
  name text,
  description text,
  duration integer,
  buffer_time integer,
  max_advance_booking integer,
  min_advance_notice integer,
  image_url text,
  availability jsonb,
  locations jsonb,
  company_name text,
  company_logo_url text,
  company_phone text,
  company_address text
) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.slug,
    s.name,
    s.description,
    s.duration,
    s.buffer_time,
    s.max_advance_booking,
    s.min_advance_notice,
    s.image_url,
    s.availability,
    s.locations,
    bs.company_name,
    bs.company_logo_url,
    bs.business_phone AS company_phone,
    bs.address AS company_address
  FROM public.appointment_schedulers s
  LEFT JOIN public.business_settings bs ON bs.user_id = s.user_id
  WHERE s.slug = slug_param AND s.active = true
  LIMIT 1;
END;
$$;
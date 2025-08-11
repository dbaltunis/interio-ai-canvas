-- 1) Lock down public reads on appointment_schedulers and keep owner/admin access only
DROP POLICY IF EXISTS "Anyone can view active schedulers by slug" ON public.appointment_schedulers;
DROP POLICY IF EXISTS "Users can view schedulers" ON public.appointment_schedulers;

CREATE POLICY "Owners and admins can view schedulers"
ON public.appointment_schedulers
FOR SELECT
USING ((auth.uid() = user_id) OR public.is_admin());

-- 2) Safe public access via RPC: returns only non-sensitive fields for a single slug
CREATE OR REPLACE FUNCTION public.get_public_scheduler(slug_param text)
RETURNS TABLE(
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
  locations jsonb
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    id, slug, name, description, duration, buffer_time, 
    max_advance_booking, min_advance_notice, image_url, availability, locations
  FROM public.appointment_schedulers
  WHERE slug = slug_param AND active = true
  LIMIT 1
$$;

GRANT EXECUTE ON FUNCTION public.get_public_scheduler(text) TO anon, authenticated;
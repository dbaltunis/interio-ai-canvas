-- Fix security warning: Set search_path for the mirror function
CREATE OR REPLACE FUNCTION public.mirror_crm_v2_to_legacy(legacy_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- No-op stub for now - will be implemented later
  -- This function will sync CRM v2 data back to legacy tables when needed
  RETURN;
END;
$$;
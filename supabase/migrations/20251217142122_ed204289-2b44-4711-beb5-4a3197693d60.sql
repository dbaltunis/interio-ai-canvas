-- Fix online presence indicator: update user's is_online status when updating last_seen
CREATE OR REPLACE FUNCTION public.update_user_last_seen(user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE user_profiles
  SET 
    last_seen = now(),
    is_online = true
  WHERE user_profiles.user_id = update_user_last_seen.user_id;
END;
$function$;
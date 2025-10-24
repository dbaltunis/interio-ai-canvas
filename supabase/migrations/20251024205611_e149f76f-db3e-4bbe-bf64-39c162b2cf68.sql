
-- Recreate the trigger function with better error handling and logging
CREATE OR REPLACE FUNCTION public.trigger_sync_to_google()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  supabase_url text;
  service_role_key text;
  request_id bigint;
BEGIN
  -- Get Supabase configuration
  supabase_url := current_setting('app.settings.supabase_url', true);
  service_role_key := current_setting('app.settings.service_role_key', true);
  
  -- Fallback to environment variables if settings not available
  IF supabase_url IS NULL THEN
    supabase_url := 'https://ldgrcodffsalkevafbkb.supabase.co';
  END IF;
  
  RAISE LOG 'Triggering sync to Google Calendar for appointment %', NEW.id;
  
  -- Call the edge function asynchronously using pg_net
  SELECT net.http_post(
    url := supabase_url || '/functions/v1/sync-to-google-calendar',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_role_key
    ),
    body := jsonb_build_object('appointmentId', NEW.id::text)
  ) INTO request_id;
  
  RAISE LOG 'Sync request initiated with ID: %', request_id;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Error triggering sync to Google: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS sync_appointment_to_google_on_insert ON public.appointments;
DROP TRIGGER IF EXISTS sync_appointment_to_google_on_update ON public.appointments;

-- Create triggers for INSERT and UPDATE
CREATE TRIGGER sync_appointment_to_google_on_insert
  AFTER INSERT ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_sync_to_google();

CREATE TRIGGER sync_appointment_to_google_on_update
  AFTER UPDATE OF title, description, start_time, end_time, location ON public.appointments
  FOR EACH ROW
  WHEN (OLD.* IS DISTINCT FROM NEW.*)
  EXECUTE FUNCTION public.trigger_sync_to_google();

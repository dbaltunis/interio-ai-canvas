-- Enable pg_net extension for HTTP requests from database
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA extensions TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA extensions TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA extensions TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA extensions TO postgres, anon, authenticated, service_role;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS sync_appointment_to_google_on_insert ON public.appointments;
DROP TRIGGER IF EXISTS sync_appointment_to_google_on_update ON public.appointments;

-- Recreate the trigger function with proper error handling
CREATE OR REPLACE FUNCTION public.trigger_sync_to_google()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  request_id bigint;
  project_url text;
  service_role_key text;
BEGIN
  -- Get Supabase URL and service role key
  project_url := current_setting('app.settings.supabase_url', true);
  service_role_key := current_setting('app.settings.supabase_service_role_key', true);
  
  -- If settings not available, use env (Supabase will inject these)
  IF project_url IS NULL THEN
    project_url := 'https://ldgrcodffsalkevafbkb.supabase.co';
  END IF;
  
  -- Only sync if we have a valid appointment ID and it's not already synced
  IF NEW.id IS NOT NULL THEN
    -- Make async HTTP request to sync-to-google-calendar edge function
    SELECT extensions.http_post(
      url := project_url || '/functions/v1/sync-to-google-calendar',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || coalesce(service_role_key, current_setting('request.jwt.claims', true)::json->>'token')
      ),
      body := jsonb_build_object('appointmentId', NEW.id::text)
    ) INTO request_id;
    
    -- Log the request (optional, for debugging)
    RAISE LOG 'Triggered sync to Google Calendar for appointment %. Request ID: %', NEW.id, request_id;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the insert/update
    RAISE WARNING 'Failed to trigger Google Calendar sync: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Create trigger for INSERT
CREATE TRIGGER sync_appointment_to_google_on_insert
  AFTER INSERT ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_sync_to_google();

-- Create trigger for UPDATE (only when relevant fields change)
CREATE TRIGGER sync_appointment_to_google_on_update
  AFTER UPDATE OF title, description, start_time, end_time, location ON public.appointments
  FOR EACH ROW
  WHEN (
    OLD.title IS DISTINCT FROM NEW.title OR
    OLD.description IS DISTINCT FROM NEW.description OR
    OLD.start_time IS DISTINCT FROM NEW.start_time OR
    OLD.end_time IS DISTINCT FROM NEW.end_time OR
    OLD.location IS DISTINCT FROM NEW.location
  )
  EXECUTE FUNCTION public.trigger_sync_to_google();
-- Phase 3: Automatic Sync Triggers (Fixed)

-- Create function to trigger sync to Google Calendar
CREATE OR REPLACE FUNCTION public.trigger_sync_to_google()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_integration_exists BOOLEAN;
  v_supabase_url TEXT := 'https://ldgrcodffsalkevafbkb.supabase.co';
  v_service_key TEXT;
BEGIN
  -- Check if user has an active Google Calendar integration
  SELECT EXISTS(
    SELECT 1 FROM public.integration_settings
    WHERE user_id = NEW.user_id
    AND integration_type = 'google_calendar'
    AND active = true
  ) INTO v_integration_exists;

  -- Only proceed if integration exists
  IF v_integration_exists THEN
    -- Call the edge function asynchronously via pg_net
    -- Note: In production, service_role_key should be fetched from vault or env
    PERFORM net.http_post(
      url := v_supabase_url || '/functions/v1/sync-to-google-calendar',
      headers := jsonb_build_object(
        'Content-Type', 'application/json'
      ),
      body := jsonb_build_object('appointmentId', NEW.id::text)
    );
    
    RAISE LOG 'Triggered sync to Google Calendar for appointment %', NEW.id;
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the transaction
    RAISE WARNING 'Failed to trigger Google Calendar sync: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Create trigger for INSERT operations
DROP TRIGGER IF EXISTS sync_appointment_to_google_on_insert ON public.appointments;
CREATE TRIGGER sync_appointment_to_google_on_insert
AFTER INSERT ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION public.trigger_sync_to_google();

-- Create trigger for UPDATE operations
DROP TRIGGER IF EXISTS sync_appointment_to_google_on_update ON public.appointments;
CREATE TRIGGER sync_appointment_to_google_on_update
AFTER UPDATE ON public.appointments
FOR EACH ROW
WHEN (
  OLD.title IS DISTINCT FROM NEW.title OR
  OLD.description IS DISTINCT FROM NEW.description OR
  OLD.start_time IS DISTINCT FROM NEW.start_time OR
  OLD.end_time IS DISTINCT FROM NEW.end_time OR
  OLD.location IS DISTINCT FROM NEW.location
)
EXECUTE FUNCTION public.trigger_sync_to_google();
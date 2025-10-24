-- Set the required settings for edge function calls
DO $$
BEGIN
  -- Set API URL
  EXECUTE format('ALTER DATABASE %I SET app.settings.api_external_url = %L',
    current_database(),
    'https://ldgrcodffsalkevafbkb.supabase.co'
  );
  
  RAISE NOTICE 'Set API external URL';
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Could not set API URL: %', SQLERRM;
END $$;

-- Create the sync function
CREATE OR REPLACE FUNCTION sync_appointment_to_google()
RETURNS TRIGGER AS $$
DECLARE
  v_supabase_url text := 'https://ldgrcodffsalkevafbkb.supabase.co';
BEGIN
  -- Check if user has active Google Calendar integration
  IF EXISTS (
    SELECT 1 FROM integration_settings 
    WHERE user_id = NEW.user_id 
    AND integration_type = 'google_calendar' 
    AND active = true
  ) THEN
    -- Call edge function to sync (async, don't wait)
    PERFORM net.http_post(
      url := v_supabase_url || '/functions/v1/sync-to-google-calendar',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('supabase.service_role_key', true)
      ),
      body := jsonb_build_object(
        'appointmentId', NEW.id
      ),
      timeout_milliseconds := 5000
    );
    
    RAISE NOTICE 'Triggered Google Calendar sync for appointment %', NEW.id;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Don't fail the appointment insert/update
    RAISE WARNING 'Failed to trigger Google Calendar sync: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recreate the trigger
DROP TRIGGER IF EXISTS trigger_sync_appointment_to_google ON appointments;

CREATE TRIGGER trigger_sync_appointment_to_google
  AFTER INSERT OR UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION sync_appointment_to_google();
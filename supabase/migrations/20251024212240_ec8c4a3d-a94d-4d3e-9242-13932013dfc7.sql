-- Fix update_user_last_seen function to stop errors
DROP FUNCTION IF EXISTS update_user_last_seen(uuid);
CREATE OR REPLACE FUNCTION update_user_last_seen(user_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE user_profiles
  SET last_seen = now()
  WHERE user_profiles.user_id = update_user_last_seen.user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to sync appointments to Google Calendar
CREATE OR REPLACE FUNCTION sync_appointment_to_google()
RETURNS TRIGGER AS $$
DECLARE
  v_supabase_url text;
  v_service_role_key text;
BEGIN
  -- Get configuration
  v_supabase_url := current_setting('app.settings.api_external_url', true);
  v_service_role_key := current_setting('app.settings.service_role_key', true);
  
  -- Only sync if we have valid settings and user has Google Calendar connected
  IF v_supabase_url IS NOT NULL AND v_service_role_key IS NOT NULL THEN
    -- Check if user has active Google Calendar integration
    IF EXISTS (
      SELECT 1 FROM integrations 
      WHERE user_id = NEW.user_id 
      AND integration_type = 'google_calendar' 
      AND active = true
    ) THEN
      -- Call edge function to sync to Google Calendar (async, don't wait for result)
      PERFORM net.http_post(
        url := v_supabase_url || '/functions/v1/sync-to-google-calendar',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || v_service_role_key
        ),
        body := jsonb_build_object(
          'appointmentId', NEW.id
        )
      );
    END IF;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the appointment insert/update
    RAISE WARNING 'Failed to sync appointment to Google Calendar: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_sync_appointment_to_google ON appointments;

-- Create trigger for INSERT and UPDATE operations
CREATE TRIGGER trigger_sync_appointment_to_google
  AFTER INSERT OR UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION sync_appointment_to_google();
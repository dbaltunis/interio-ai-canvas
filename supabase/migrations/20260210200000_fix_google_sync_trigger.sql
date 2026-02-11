-- Fix Google Calendar sync trigger:
-- 1. Remove hardcoded Supabase URL - use app.settings.api_external_url
-- 2. Use fallback chain for service role key
-- 3. Fix table reference (integration_settings, not integrations)

CREATE OR REPLACE FUNCTION sync_appointment_to_google()
RETURNS TRIGGER AS $$
DECLARE
  v_supabase_url text;
  v_service_role_key text;
BEGIN
  -- Get URL from database settings (set via ALTER DATABASE)
  v_supabase_url := current_setting('app.settings.api_external_url', true);

  -- Try multiple sources for the service role key
  v_service_role_key := current_setting('app.settings.service_role_key', true);
  IF v_service_role_key IS NULL THEN
    v_service_role_key := current_setting('supabase.service_role_key', true);
  END IF;

  -- Only proceed if we have both URL and key configured
  IF v_supabase_url IS NULL OR v_service_role_key IS NULL THEN
    -- Silently skip - frontend syncToConnectedCalendars() handles this case
    RETURN NEW;
  END IF;

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
        'Authorization', 'Bearer ' || v_service_role_key
      ),
      body := jsonb_build_object(
        'appointmentId', NEW.id
      ),
      timeout_milliseconds := 5000
    );
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Never fail the appointment insert/update due to sync issues
    RAISE WARNING 'Google Calendar sync trigger error: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recreate the trigger
DROP TRIGGER IF EXISTS trigger_sync_appointment_to_google ON appointments;

CREATE TRIGGER trigger_sync_appointment_to_google
  AFTER INSERT OR UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION sync_appointment_to_google();

-- Set the service role key in database settings for Google Calendar sync
-- This allows the trigger to authenticate edge function calls
DO $$
BEGIN
  -- Set the service role key from environment variable
  -- This will be available in the database for the trigger function to use
  EXECUTE format('ALTER DATABASE %I SET app.settings.service_role_key = %L', 
    current_database(),
    current_setting('supabase.service_role_key', true)
  );
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Could not set service role key. Please set it manually using: ALTER DATABASE postgres SET app.settings.service_role_key = ''your-service-role-key'';';
END $$;
-- Remove the broken database trigger that uses net.http_post
DROP TRIGGER IF EXISTS trigger_sync_appointment_to_google ON appointments;
DROP FUNCTION IF EXISTS sync_appointment_to_google();

-- Note: Sync will now be handled at the application level in React hooks
-- This provides better error handling, logging, and user feedback
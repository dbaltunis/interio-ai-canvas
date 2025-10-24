-- Drop all CalDAV-related tables
DROP TABLE IF EXISTS public.caldav_sync_events CASCADE;
DROP TABLE IF EXISTS public.caldav_calendars CASCADE;
DROP TABLE IF EXISTS public.caldav_accounts CASCADE;

-- Clean up any CalDAV-related data from integration_settings
DELETE FROM public.integration_settings 
WHERE integration_type = 'caldav' OR integration_type LIKE '%caldav%';
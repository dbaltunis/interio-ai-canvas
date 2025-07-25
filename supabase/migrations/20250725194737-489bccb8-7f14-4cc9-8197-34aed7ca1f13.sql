-- Add CalDAV sync fields to appointments table for two-way sync
ALTER TABLE public.appointments 
ADD COLUMN caldav_uid TEXT,
ADD COLUMN caldav_calendar_id UUID,
ADD COLUMN caldav_etag TEXT,
ADD COLUMN last_caldav_sync TIMESTAMP WITH TIME ZONE;

-- Create index for CalDAV lookups
CREATE INDEX idx_appointments_caldav_uid ON public.appointments(caldav_uid);
CREATE INDEX idx_appointments_caldav_calendar ON public.appointments(caldav_calendar_id);

-- Update existing CalDAV calendar sync fields
ALTER TABLE public.caldav_calendars 
ADD COLUMN IF NOT EXISTS etag TEXT,
ADD COLUMN IF NOT EXISTS caldav_url TEXT;
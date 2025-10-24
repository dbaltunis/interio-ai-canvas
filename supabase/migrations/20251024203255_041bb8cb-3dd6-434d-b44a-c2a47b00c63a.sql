-- Phase 1: Database Foundation for Google Calendar Sync

-- Create google_calendar_sync_events table
CREATE TABLE IF NOT EXISTS public.google_calendar_sync_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  integration_id UUID NOT NULL REFERENCES public.integration_settings(id) ON DELETE CASCADE,
  appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  google_event_id TEXT NOT NULL,
  sync_direction TEXT NOT NULL CHECK (sync_direction IN ('to_google', 'from_google', 'bidirectional')),
  last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(appointment_id, google_event_id)
);

-- Enable RLS on google_calendar_sync_events
ALTER TABLE public.google_calendar_sync_events ENABLE ROW LEVEL SECURITY;

-- RLS policies for google_calendar_sync_events
CREATE POLICY "Users can view their own sync events"
ON public.google_calendar_sync_events
FOR SELECT
USING (
  integration_id IN (
    SELECT id FROM public.integration_settings 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "System can manage sync events"
ON public.google_calendar_sync_events
FOR ALL
USING (true)
WITH CHECK (true);

-- Add google_event_id to appointments table
ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS google_event_id TEXT;

-- Remove CalDAV columns from appointments (if they exist)
ALTER TABLE public.appointments 
DROP COLUMN IF EXISTS caldav_uid,
DROP COLUMN IF EXISTS caldav_calendar_id,
DROP COLUMN IF EXISTS caldav_etag,
DROP COLUMN IF EXISTS last_caldav_sync;

-- Create index for faster sync lookups
CREATE INDEX IF NOT EXISTS idx_appointments_google_event_id 
ON public.appointments(google_event_id) WHERE google_event_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_sync_events_appointment 
ON public.google_calendar_sync_events(appointment_id);

CREATE INDEX IF NOT EXISTS idx_sync_events_google_event 
ON public.google_calendar_sync_events(google_event_id);

-- Drop caldav_sync_log table if it exists
DROP TABLE IF EXISTS public.caldav_sync_log CASCADE;

-- Create table to store Google Calendar integration tokens
CREATE TABLE public.google_calendar_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  calendar_id TEXT,
  sync_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.google_calendar_integrations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own Google Calendar integrations" 
  ON public.google_calendar_integrations 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own Google Calendar integrations" 
  ON public.google_calendar_integrations 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Google Calendar integrations" 
  ON public.google_calendar_integrations 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own Google Calendar integrations" 
  ON public.google_calendar_integrations 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create table to track synced events
CREATE TABLE public.google_calendar_sync_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  integration_id UUID REFERENCES public.google_calendar_integrations(id) ON DELETE CASCADE NOT NULL,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE,
  google_event_id TEXT NOT NULL,
  sync_direction TEXT NOT NULL CHECK (sync_direction IN ('to_google', 'from_google', 'bidirectional')),
  last_synced_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS for sync events
ALTER TABLE public.google_calendar_sync_events ENABLE ROW LEVEL SECURITY;

-- Allow users to manage sync events for their integrations
CREATE POLICY "Users can manage sync events for their integrations" 
  ON public.google_calendar_sync_events 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.google_calendar_integrations 
    WHERE google_calendar_integrations.id = google_calendar_sync_events.integration_id 
    AND google_calendar_integrations.user_id = auth.uid()
  ));

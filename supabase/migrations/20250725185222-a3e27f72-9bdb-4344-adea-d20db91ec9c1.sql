-- Create CalDAV accounts table
CREATE TABLE public.caldav_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  account_name TEXT NOT NULL,
  email TEXT NOT NULL,
  server_url TEXT,
  username TEXT NOT NULL,
  password_encrypted TEXT NOT NULL,
  sync_enabled BOOLEAN NOT NULL DEFAULT true,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  sync_token TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, email)
);

-- Enable RLS
ALTER TABLE public.caldav_accounts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own CalDAV accounts" 
ON public.caldav_accounts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own CalDAV accounts" 
ON public.caldav_accounts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own CalDAV accounts" 
ON public.caldav_accounts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own CalDAV accounts" 
ON public.caldav_accounts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create CalDAV calendars table
CREATE TABLE public.caldav_calendars (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES public.caldav_accounts(id) ON DELETE CASCADE,
  calendar_id TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  color TEXT,
  timezone TEXT DEFAULT 'UTC',
  sync_enabled BOOLEAN NOT NULL DEFAULT true,
  read_only BOOLEAN NOT NULL DEFAULT false,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  sync_token TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(account_id, calendar_id)
);

-- Enable RLS for calendars
ALTER TABLE public.caldav_calendars ENABLE ROW LEVEL SECURITY;

-- Create policies for calendars
CREATE POLICY "Users can view calendars from their accounts" 
ON public.caldav_calendars 
FOR SELECT 
USING (
  account_id IN (
    SELECT id FROM public.caldav_accounts 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage calendars from their accounts" 
ON public.caldav_calendars 
FOR ALL 
USING (
  account_id IN (
    SELECT id FROM public.caldav_accounts 
    WHERE user_id = auth.uid()
  )
);

-- Create CalDAV sync log table
CREATE TABLE public.caldav_sync_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES public.caldav_accounts(id) ON DELETE CASCADE,
  calendar_id UUID REFERENCES public.caldav_calendars(id) ON DELETE CASCADE,
  sync_type TEXT NOT NULL CHECK (sync_type IN ('full', 'incremental', 'push')),
  status TEXT NOT NULL CHECK (status IN ('started', 'completed', 'failed')),
  events_synced INTEGER DEFAULT 0,
  events_created INTEGER DEFAULT 0,
  events_updated INTEGER DEFAULT 0,
  events_deleted INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for sync log
ALTER TABLE public.caldav_sync_log ENABLE ROW LEVEL SECURITY;

-- Create policy for sync log
CREATE POLICY "Users can view sync logs from their accounts" 
ON public.caldav_sync_log 
FOR SELECT 
USING (
  account_id IN (
    SELECT id FROM public.caldav_accounts 
    WHERE user_id = auth.uid()
  )
);

-- Add updated_at trigger for accounts
CREATE TRIGGER update_caldav_accounts_updated_at
BEFORE UPDATE ON public.caldav_accounts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add updated_at trigger for calendars
CREATE TRIGGER update_caldav_calendars_updated_at
BEFORE UPDATE ON public.caldav_calendars
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
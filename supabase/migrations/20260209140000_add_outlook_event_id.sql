-- Add outlook_event_id column to appointments table for Outlook Calendar sync
ALTER TABLE public.appointments
ADD COLUMN IF NOT EXISTS outlook_event_id text;

-- Create index for efficient Outlook sync lookups
CREATE INDEX IF NOT EXISTS idx_appointments_outlook_event_id
ON public.appointments(outlook_event_id)
WHERE outlook_event_id IS NOT NULL;

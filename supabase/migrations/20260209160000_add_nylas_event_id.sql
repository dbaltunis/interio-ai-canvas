-- Add nylas_event_id column to appointments table for Nylas Calendar sync
ALTER TABLE public.appointments
ADD COLUMN IF NOT EXISTS nylas_event_id text;

-- Create index for efficient Nylas sync lookups
CREATE INDEX IF NOT EXISTS idx_appointments_nylas_event_id
ON public.appointments(nylas_event_id)
WHERE nylas_event_id IS NOT NULL;

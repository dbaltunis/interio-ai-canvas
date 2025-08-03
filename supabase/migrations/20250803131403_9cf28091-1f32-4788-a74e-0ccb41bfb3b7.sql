-- Make client_id optional in client_measurements table to allow measurements without clients
ALTER TABLE public.client_measurements ALTER COLUMN client_id DROP NOT NULL;

-- Add a comment to clarify this change
COMMENT ON COLUMN public.client_measurements.client_id IS 'Optional client reference - measurements can exist without being assigned to a specific client';
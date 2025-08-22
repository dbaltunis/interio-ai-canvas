-- Allow room_id to be nullable in treatments table since some windows might not have assigned rooms
ALTER TABLE public.treatments 
ALTER COLUMN room_id DROP NOT NULL;
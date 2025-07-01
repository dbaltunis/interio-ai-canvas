
-- Allow client_id to be nullable in quotes table to support jobs without clients
ALTER TABLE public.quotes ALTER COLUMN client_id DROP NOT NULL;

-- Add quote_id to rooms and treatments to support quote versioning
-- This allows each quote version to have its own set of rooms and treatments

-- Add quote_id column to rooms
ALTER TABLE public.rooms 
ADD COLUMN IF NOT EXISTS quote_id UUID REFERENCES public.quotes(id) ON DELETE CASCADE;

-- Add quote_id column to treatments
ALTER TABLE public.treatments 
ADD COLUMN IF NOT EXISTS quote_id UUID REFERENCES public.quotes(id) ON DELETE CASCADE;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_rooms_quote_id ON public.rooms(quote_id);
CREATE INDEX IF NOT EXISTS idx_treatments_quote_id ON public.treatments(quote_id);

-- For existing data, we'll keep the project_id relationship
-- New quote versions will use quote_id to separate their data
-- This allows backwards compatibility with existing projects
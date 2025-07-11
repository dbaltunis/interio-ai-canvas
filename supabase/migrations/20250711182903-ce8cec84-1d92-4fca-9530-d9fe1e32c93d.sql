
-- Add missing calculation_details column to treatments table
ALTER TABLE public.treatments 
ADD COLUMN IF NOT EXISTS calculation_details JSONB DEFAULT '{}'::jsonb;

-- Also ensure other JSON columns exist for storing treatment data
ALTER TABLE public.treatments 
ADD COLUMN IF NOT EXISTS measurements JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS fabric_details JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS treatment_details JSONB DEFAULT '{}'::jsonb;

-- Update the treatments table to ensure all necessary fields are present
ALTER TABLE public.treatments 
ADD COLUMN IF NOT EXISTS fabric_type TEXT,
ADD COLUMN IF NOT EXISTS color TEXT,
ADD COLUMN IF NOT EXISTS pattern TEXT,
ADD COLUMN IF NOT EXISTS hardware TEXT,
ADD COLUMN IF NOT EXISTS mounting_type TEXT;

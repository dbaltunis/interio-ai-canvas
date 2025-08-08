-- Fix windows_summary table to remove template_id requirement and make currency non-nullable with proper default
ALTER TABLE public.windows_summary 
ALTER COLUMN template_id DROP NOT NULL;

ALTER TABLE public.windows_summary 
ALTER COLUMN currency SET DEFAULT 'GBP';

UPDATE public.windows_summary 
SET currency = 'GBP' 
WHERE currency IS NULL;

ALTER TABLE public.windows_summary 
ALTER COLUMN currency SET NOT NULL;
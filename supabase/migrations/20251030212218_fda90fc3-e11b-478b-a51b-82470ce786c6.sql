-- Add description_text column to windows_summary for editable descriptions
ALTER TABLE public.windows_summary 
ADD COLUMN IF NOT EXISTS description_text TEXT;
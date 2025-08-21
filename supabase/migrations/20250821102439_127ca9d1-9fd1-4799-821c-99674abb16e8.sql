-- Add version column to quotes table
ALTER TABLE public.quotes ADD COLUMN version integer DEFAULT 1 NOT NULL;

-- Create index for better performance when querying versions
CREATE INDEX idx_quotes_project_version ON public.quotes(project_id, version);

-- Update existing quotes to have version 1
UPDATE public.quotes SET version = 1 WHERE version IS NULL;
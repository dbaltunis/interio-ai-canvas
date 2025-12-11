-- Add columns to store document numbers per stage
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS draft_number text,
ADD COLUMN IF NOT EXISTS quote_number text,
ADD COLUMN IF NOT EXISTS order_number text,
ADD COLUMN IF NOT EXISTS invoice_number text;

-- Migrate existing projects: populate stage-specific columns based on current job_number format
UPDATE public.projects 
SET draft_number = job_number 
WHERE job_number LIKE 'DRAFT-%' OR job_number LIKE 'DFT-%';

UPDATE public.projects 
SET quote_number = job_number 
WHERE job_number LIKE 'QUOTE-%' OR job_number LIKE 'QT-%';

UPDATE public.projects 
SET order_number = job_number 
WHERE job_number LIKE 'ORDER-%' OR job_number LIKE 'ORD-%';

UPDATE public.projects 
SET invoice_number = job_number 
WHERE job_number LIKE 'INV-%' OR job_number LIKE 'INVOICE-%';

-- For JOB- prefixed numbers, store in draft_number as the base
UPDATE public.projects 
SET draft_number = job_number 
WHERE job_number LIKE 'JOB-%' AND draft_number IS NULL;
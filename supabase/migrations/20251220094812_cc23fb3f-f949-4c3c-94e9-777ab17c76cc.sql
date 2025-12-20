-- Add document_type column to job_statuses
-- This allows mapping each status to a specific number sequence type
ALTER TABLE public.job_statuses 
ADD COLUMN IF NOT EXISTS document_type TEXT 
CHECK (document_type IN ('draft', 'quote', 'order', 'invoice', 'job'));

-- Set default document_type based on slot_number patterns (sensible defaults)
-- Slots 1-3 are typically Quote stages (draft/quote)
-- Slots 4-9 are typically Order stages
-- Slot 10 is typically Invoice/Completed
UPDATE public.job_statuses SET document_type = 'draft' WHERE slot_number = 1 AND document_type IS NULL;
UPDATE public.job_statuses SET document_type = 'quote' WHERE slot_number IN (2, 3) AND document_type IS NULL;
UPDATE public.job_statuses SET document_type = 'order' WHERE slot_number IN (4, 5, 6, 7, 8, 9) AND document_type IS NULL;
UPDATE public.job_statuses SET document_type = 'invoice' WHERE slot_number = 10 AND document_type IS NULL;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_job_statuses_document_type ON public.job_statuses(document_type);

-- Comment for documentation
COMMENT ON COLUMN public.job_statuses.document_type IS 'Links status to number sequence type: draft, quote, order, invoice, or job';
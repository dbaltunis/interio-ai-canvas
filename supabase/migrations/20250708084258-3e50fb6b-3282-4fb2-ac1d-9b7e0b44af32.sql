-- Update projects status constraint to include 'quote' status
ALTER TABLE public.projects 
DROP CONSTRAINT projects_status_check;

ALTER TABLE public.projects 
ADD CONSTRAINT projects_status_check 
CHECK (status = ANY (ARRAY['planning', 'measuring', 'quote', 'quoted', 'approved', 'in-production', 'completed', 'cancelled']));

-- Update quotes status constraint to include 'quote' status  
ALTER TABLE public.quotes 
DROP CONSTRAINT quotes_status_check;

ALTER TABLE public.quotes 
ADD CONSTRAINT quotes_status_check 
CHECK (status = ANY (ARRAY['draft', 'quote', 'sent', 'viewed', 'accepted', 'rejected', 'expired']));
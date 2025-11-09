-- Add foreign key relationship for template

ALTER TABLE public.online_stores
ADD CONSTRAINT online_stores_template_id_fkey 
FOREIGN KEY (template_id) 
REFERENCES public.store_templates(id)
ON DELETE SET NULL;
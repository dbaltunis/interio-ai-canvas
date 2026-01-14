-- Add treatment filter column to projects (if not exists)
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS work_order_treatment_filter jsonb DEFAULT '[]'::jsonb;

-- Allow anonymous users to read workshop_items for shared work orders
CREATE POLICY "Allow public read access to workshop_items via shared project"
ON public.workshop_items
FOR SELECT
TO anon
USING (
  project_id IN (
    SELECT id FROM public.projects 
    WHERE work_order_token IS NOT NULL 
    AND work_order_shared_at IS NOT NULL
  )
);
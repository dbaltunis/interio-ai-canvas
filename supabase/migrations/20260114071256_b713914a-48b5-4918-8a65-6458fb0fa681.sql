-- Add permission_level to work_order_shares
ALTER TABLE public.work_order_shares
ADD COLUMN IF NOT EXISTS permission_level text DEFAULT 'view';

-- Add content filter settings to projects
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS work_order_document_type text DEFAULT 'work_order';

ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS work_order_content_filter jsonb DEFAULT '{"type": "all"}'::jsonb;

-- Add comment for status workflow values
COMMENT ON COLUMN public.workshop_items.status IS 'Status values: pending, measured, in_production, ready, installed';

-- Create index for faster recipient lookups
CREATE INDEX IF NOT EXISTS idx_work_order_shares_project_active 
ON public.work_order_shares(project_id, is_active);

-- Allow public (anonymous) users to update workshop_items status
-- This is needed for field workers to mark items as measured/installed
CREATE POLICY "Allow public status updates for shared work orders"
ON public.workshop_items
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = workshop_items.project_id
    AND p.work_order_token IS NOT NULL
    AND p.work_order_shared_at IS NOT NULL
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = workshop_items.project_id
    AND p.work_order_token IS NOT NULL
    AND p.work_order_shared_at IS NOT NULL
  )
);
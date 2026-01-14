-- Allow shared_by to be nullable for viewer-created sessions
ALTER TABLE public.work_order_shares 
ALTER COLUMN shared_by DROP NOT NULL;

-- Update RLS policy for anonymous insert to not require shared_by
DROP POLICY IF EXISTS "Allow anonymous viewers to create their own session" ON public.work_order_shares;

CREATE POLICY "Allow anonymous viewers to create their own session"
ON public.work_order_shares
FOR INSERT
TO anon
WITH CHECK (created_by_viewer = true AND shared_by IS NULL);
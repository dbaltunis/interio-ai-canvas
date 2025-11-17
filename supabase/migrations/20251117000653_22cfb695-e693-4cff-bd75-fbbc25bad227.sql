-- Add RLS policy for default_inventory_templates
-- This table contains system-wide default templates that should be visible to all authenticated users

-- Allow all authenticated users to view default templates
CREATE POLICY "Authenticated users can view default templates" ON public.default_inventory_templates
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Only system admins can modify (for future use)
-- For now, we'll allow insert/update/delete through service role only (no policies)
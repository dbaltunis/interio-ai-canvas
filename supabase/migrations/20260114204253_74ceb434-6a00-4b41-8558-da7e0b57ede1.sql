-- Create work_order_share_links table for multi-link architecture
CREATE TABLE IF NOT EXISTS public.work_order_share_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  token UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  name TEXT,
  document_type TEXT NOT NULL DEFAULT 'work_order',
  content_filter TEXT NOT NULL DEFAULT 'all',
  treatment_filter JSONB DEFAULT '[]'::jsonb,
  pin TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id)
);

-- Add share_link_id to work_order_shares to link viewers to specific links
ALTER TABLE public.work_order_shares 
ADD COLUMN IF NOT EXISTS share_link_id UUID REFERENCES public.work_order_share_links(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE public.work_order_share_links ENABLE ROW LEVEL SECURITY;

-- RLS Policies for work_order_share_links

-- Authenticated users can view their own share links
CREATE POLICY "Users can view their own share links" 
ON public.work_order_share_links 
FOR SELECT 
TO authenticated
USING (
  created_by = auth.uid() OR 
  project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
);

-- Users can create share links for their projects
CREATE POLICY "Users can create share links for their projects" 
ON public.work_order_share_links 
FOR INSERT 
TO authenticated
WITH CHECK (
  project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
);

-- Users can update their own share links
CREATE POLICY "Users can update their own share links" 
ON public.work_order_share_links 
FOR UPDATE 
TO authenticated
USING (
  created_by = auth.uid() OR 
  project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
);

-- Users can delete their own share links
CREATE POLICY "Users can delete their own share links" 
ON public.work_order_share_links 
FOR DELETE 
TO authenticated
USING (
  created_by = auth.uid() OR 
  project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
);

-- Anonymous users can read active share links by token (for public page)
CREATE POLICY "Public can read share links by token" 
ON public.work_order_share_links 
FOR SELECT 
TO anon
USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

-- Index for token lookup
CREATE INDEX IF NOT EXISTS idx_work_order_share_links_token ON public.work_order_share_links(token);
CREATE INDEX IF NOT EXISTS idx_work_order_share_links_project_id ON public.work_order_share_links(project_id);

-- Trigger for updated_at
CREATE OR REPLACE TRIGGER update_work_order_share_links_updated_at
  BEFORE UPDATE ON public.work_order_share_links
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
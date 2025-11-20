-- Create client_fabric_pool table to track leftover fabric per client
CREATE TABLE IF NOT EXISTS public.client_fabric_pool (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  fabric_id UUID NOT NULL REFERENCES public.enhanced_inventory_items(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  window_id UUID REFERENCES public.windows_summary(window_id) ON DELETE SET NULL,
  treatment_name TEXT,
  
  -- Leftover details
  leftover_length_cm NUMERIC NOT NULL CHECK (leftover_length_cm > 0),
  fabric_width_cm NUMERIC NOT NULL,
  orientation TEXT NOT NULL CHECK (orientation IN ('vertical', 'horizontal')),
  
  -- Usage tracking
  is_available BOOLEAN NOT NULL DEFAULT true,
  used_in_window_id UUID REFERENCES public.windows_summary(window_id) ON DELETE SET NULL,
  used_in_treatment_name TEXT,
  used_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  
  -- Indexes for quick lookups
  CONSTRAINT unique_available_fabric UNIQUE NULLS NOT DISTINCT (client_id, fabric_id, is_available, used_in_window_id)
);

-- Index for finding available leftover for a client
CREATE INDEX idx_fabric_pool_client_available ON public.client_fabric_pool(client_id, is_available) WHERE is_available = true;

-- Index for fabric lookup
CREATE INDEX idx_fabric_pool_fabric ON public.client_fabric_pool(fabric_id);

-- Index for project tracking
CREATE INDEX idx_fabric_pool_project ON public.client_fabric_pool(project_id);

-- RLS policies
ALTER TABLE public.client_fabric_pool ENABLE ROW LEVEL SECURITY;

-- Users can view fabric pool for their clients
CREATE POLICY "Users can view fabric pool for their clients"
ON public.client_fabric_pool
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.clients c
    WHERE c.id = client_fabric_pool.client_id
    AND c.user_id = auth.uid()
  )
);

-- Users can insert fabric pool for their clients
CREATE POLICY "Users can insert fabric pool for their clients"
ON public.client_fabric_pool
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.clients c
    WHERE c.id = client_fabric_pool.client_id
    AND c.user_id = auth.uid()
  )
);

-- Users can update fabric pool for their clients
CREATE POLICY "Users can update fabric pool for their clients"
ON public.client_fabric_pool
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.clients c
    WHERE c.id = client_fabric_pool.client_id
    AND c.user_id = auth.uid()
  )
);

-- Users can delete fabric pool for their clients
CREATE POLICY "Users can delete fabric pool for their clients"
ON public.client_fabric_pool
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.clients c
    WHERE c.id = client_fabric_pool.client_id
    AND c.user_id = auth.uid()
  )
);

-- Trigger to update updated_at
CREATE TRIGGER update_fabric_pool_updated_at
BEFORE UPDATE ON public.client_fabric_pool
FOR EACH ROW
EXECUTE FUNCTION public.update_windows_summary_timestamp();

COMMENT ON TABLE public.client_fabric_pool IS 'Tracks leftover fabric pieces per client for reuse across treatments';
COMMENT ON COLUMN public.client_fabric_pool.leftover_length_cm IS 'Length of leftover fabric in centimeters';
COMMENT ON COLUMN public.client_fabric_pool.orientation IS 'Fabric orientation: vertical (standard) or horizontal (railroaded)';
COMMENT ON COLUMN public.client_fabric_pool.is_available IS 'Whether this leftover piece is still available for use';
COMMENT ON COLUMN public.client_fabric_pool.used_in_window_id IS 'The window/treatment where this leftover was reused';
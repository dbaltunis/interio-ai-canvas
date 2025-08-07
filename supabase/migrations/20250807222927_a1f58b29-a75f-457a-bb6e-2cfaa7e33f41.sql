-- Create windows_summary table to store calculated pricing snapshots
CREATE TABLE IF NOT EXISTS public.windows_summary (
  window_id UUID PRIMARY KEY REFERENCES public.surfaces(id) ON DELETE CASCADE,
  linear_meters NUMERIC,
  widths_required INTEGER,
  price_per_meter NUMERIC,
  fabric_cost NUMERIC,
  lining_type TEXT,
  lining_cost NUMERIC DEFAULT 0,
  manufacturing_type TEXT,
  manufacturing_cost NUMERIC,
  total_cost NUMERIC,
  template_id UUID,
  pricing_type TEXT,
  waste_percent NUMERIC,
  currency TEXT DEFAULT 'GBP',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.windows_summary ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read their own window summaries
CREATE POLICY "Users can read own window summaries" 
ON public.windows_summary 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.surfaces s
    JOIN public.projects p ON s.project_id = p.id
    WHERE s.id = windows_summary.window_id 
    AND p.user_id = auth.uid()
  )
);

-- Create policy for users to insert/update their own window summaries
CREATE POLICY "Users can manage own window summaries" 
ON public.windows_summary 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.surfaces s
    JOIN public.projects p ON s.project_id = p.id
    WHERE s.id = windows_summary.window_id 
    AND p.user_id = auth.uid()
  )
);

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION public.update_windows_summary_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update timestamp
CREATE TRIGGER update_windows_summary_timestamp
  BEFORE UPDATE ON public.windows_summary
  FOR EACH ROW
  EXECUTE FUNCTION public.update_windows_summary_timestamp();
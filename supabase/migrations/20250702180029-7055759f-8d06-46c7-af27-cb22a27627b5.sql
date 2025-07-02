-- Add making_cost_id to window_coverings table
ALTER TABLE public.window_coverings 
ADD COLUMN making_cost_id UUID REFERENCES public.making_costs(id);

-- Add an index for better performance
CREATE INDEX idx_window_coverings_making_cost_id ON public.window_coverings(making_cost_id);
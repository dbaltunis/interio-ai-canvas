-- Create quote_items table for storing individual line items in quotes
CREATE TABLE public.quote_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  quantity NUMERIC NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  total_price NUMERIC NOT NULL DEFAULT 0,
  product_details JSONB DEFAULT '{}',
  breakdown JSONB DEFAULT '{}',
  currency TEXT DEFAULT 'USD',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create workshop_items table for storing workroom production items
CREATE TABLE public.workshop_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  window_id UUID,
  room_name TEXT,
  surface_name TEXT NOT NULL,
  treatment_type TEXT NOT NULL DEFAULT 'curtains',
  fabric_details JSONB DEFAULT '{}',
  measurements JSONB DEFAULT '{}',
  manufacturing_details JSONB DEFAULT '{}',
  linear_meters NUMERIC,
  widths_required INTEGER,
  total_cost NUMERIC DEFAULT 0,
  priority TEXT DEFAULT 'normal',
  status TEXT DEFAULT 'pending',
  assigned_to UUID,
  notes TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID NOT NULL
);

-- Enable RLS on both tables
ALTER TABLE public.quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshop_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for quote_items
CREATE POLICY "Users can view quote items for their quotes" 
ON public.quote_items 
FOR SELECT 
USING (quote_id IN (
  SELECT id FROM public.quotes WHERE user_id = auth.uid()
));

CREATE POLICY "Users can create quote items for their quotes" 
ON public.quote_items 
FOR INSERT 
WITH CHECK (quote_id IN (
  SELECT id FROM public.quotes WHERE user_id = auth.uid()
));

CREATE POLICY "Users can update quote items for their quotes" 
ON public.quote_items 
FOR UPDATE 
USING (quote_id IN (
  SELECT id FROM public.quotes WHERE user_id = auth.uid()
));

CREATE POLICY "Users can delete quote items for their quotes" 
ON public.quote_items 
FOR DELETE 
USING (quote_id IN (
  SELECT id FROM public.quotes WHERE user_id = auth.uid()
));

-- RLS policies for workshop_items
CREATE POLICY "Users can view their workshop items" 
ON public.workshop_items 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their workshop items" 
ON public.workshop_items 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their workshop items" 
ON public.workshop_items 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their workshop items" 
ON public.workshop_items 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_quote_items_quote_id ON public.quote_items(quote_id);
CREATE INDEX idx_quote_items_sort_order ON public.quote_items(quote_id, sort_order);
CREATE INDEX idx_workshop_items_project_id ON public.workshop_items(project_id);
CREATE INDEX idx_workshop_items_user_id ON public.workshop_items(user_id);
CREATE INDEX idx_workshop_items_status ON public.workshop_items(status);
CREATE INDEX idx_workshop_items_priority ON public.workshop_items(priority);

-- Add triggers for automatic timestamp updates
CREATE TRIGGER update_quote_items_updated_at
  BEFORE UPDATE ON public.quote_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workshop_items_updated_at
  BEFORE UPDATE ON public.workshop_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
-- Create product templates table
CREATE TABLE public.product_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  product_type TEXT NOT NULL,
  calculation_method TEXT NOT NULL DEFAULT 'per-linear-meter',
  pricing_unit TEXT NOT NULL DEFAULT 'per-meter',
  measurement_requirements JSONB DEFAULT '[]'::jsonb,
  components JSONB DEFAULT '{}'::jsonb,
  calculation_rules JSONB DEFAULT '{}'::jsonb,
  making_cost_required BOOLEAN DEFAULT false,
  pricing_grid_required BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.product_templates ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own product templates" 
ON public.product_templates 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own product templates" 
ON public.product_templates 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own product templates" 
ON public.product_templates 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own product templates" 
ON public.product_templates 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_product_templates_updated_at
BEFORE UPDATE ON public.product_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
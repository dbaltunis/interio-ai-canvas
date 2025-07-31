-- Create quote templates table
CREATE TABLE public.quote_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  template_style TEXT NOT NULL DEFAULT 'detailed',
  blocks JSONB NOT NULL DEFAULT '[]'::jsonb,
  preview_image_url TEXT,
  is_default BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quote_templates ENABLE ROW LEVEL SECURITY;

-- Create policies for quote templates
CREATE POLICY "Users can view their own quote templates" 
ON public.quote_templates 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own quote templates" 
ON public.quote_templates 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quote templates" 
ON public.quote_templates 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own quote templates" 
ON public.quote_templates 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for updating timestamps
CREATE TRIGGER update_quote_templates_updated_at
BEFORE UPDATE ON public.quote_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_quote_templates_user_id ON public.quote_templates(user_id);
CREATE INDEX idx_quote_templates_active ON public.quote_templates(active) WHERE active = true;
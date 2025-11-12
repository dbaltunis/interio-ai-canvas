-- Create work_order_templates table
CREATE TABLE IF NOT EXISTS public.work_order_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  blocks JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable Row Level Security
ALTER TABLE public.work_order_templates ENABLE ROW LEVEL SECURITY;

-- Create policies for work_order_templates
CREATE POLICY "Users can view work order templates"
ON public.work_order_templates
FOR SELECT
USING (true);

CREATE POLICY "Users can create their own work order templates"
ON public.work_order_templates
FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own work order templates"
ON public.work_order_templates
FOR UPDATE
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own work order templates"
ON public.work_order_templates
FOR DELETE
USING (auth.uid() = created_by);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_work_order_templates_updated_at
BEFORE UPDATE ON public.work_order_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default work order template
INSERT INTO public.work_order_templates (name, active, blocks, created_by)
SELECT 
  'Default Work Order Template',
  true,
  '[
    {
      "type": "document-settings",
      "content": {
        "orientation": "portrait",
        "marginTop": 8,
        "marginRight": 8,
        "marginBottom": 6,
        "marginLeft": 8,
        "imageSize": 80,
        "imagePosition": "above"
      }
    },
    {
      "type": "workorder-header",
      "content": {
        "showOrderNumber": true,
        "showClientName": true,
        "showProjectName": true,
        "showDates": true
      }
    },
    {
      "type": "workorder-items",
      "content": {
        "showRoomNames": true,
        "showMaterials": true,
        "showMeasurements": true,
        "showCheckpoints": true,
        "showImages": true,
        "showDetailedSpecs": true,
        "groupByRoom": true
      }
    }
  ]'::jsonb,
  auth.uid()
WHERE NOT EXISTS (
  SELECT 1 FROM public.work_order_templates WHERE name = 'Default Work Order Template'
);
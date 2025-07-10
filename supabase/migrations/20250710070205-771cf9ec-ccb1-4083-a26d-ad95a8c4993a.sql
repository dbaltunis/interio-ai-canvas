-- Create product configurations table to store the main product setup
CREATE TABLE public.product_configurations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  product_type TEXT NOT NULL, -- 'curtains', 'drapes', 'blinds', etc.
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create product room assignments table to link products to specific rooms
CREATE TABLE public.product_room_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_configuration_id UUID NOT NULL REFERENCES public.product_configurations(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create product details table to store specific product configuration details
CREATE TABLE public.product_details (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_configuration_id UUID NOT NULL REFERENCES public.product_configurations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  style TEXT, -- 'pinch-pleat', 'eyelet', 'tab-top', etc.
  fabric_type TEXT,
  fabric_color TEXT,
  fabric_pattern TEXT,
  lining_type TEXT,
  heading_style TEXT,
  measurements JSONB DEFAULT '{}',
  hardware_details JSONB DEFAULT '{}',
  additional_options JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create canvas designs table to store design canvas data
CREATE TABLE public.canvas_designs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_configuration_id UUID NOT NULL REFERENCES public.product_configurations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  design_data JSONB NOT NULL DEFAULT '{}', -- stores canvas elements, positions, etc.
  preview_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.product_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_room_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.canvas_designs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for product_configurations
CREATE POLICY "Users can manage their own product configurations" 
ON public.product_configurations 
FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for product_room_assignments
CREATE POLICY "Users can manage their own product room assignments" 
ON public.product_room_assignments 
FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for product_details
CREATE POLICY "Users can manage their own product details" 
ON public.product_details 
FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for canvas_designs
CREATE POLICY "Users can manage their own canvas designs" 
ON public.canvas_designs 
FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_product_configurations_project_id ON public.product_configurations(project_id);
CREATE INDEX idx_product_configurations_user_id ON public.product_configurations(user_id);
CREATE INDEX idx_product_room_assignments_product_id ON public.product_room_assignments(product_configuration_id);
CREATE INDEX idx_product_room_assignments_room_id ON public.product_room_assignments(room_id);
CREATE INDEX idx_product_details_product_id ON public.product_details(product_configuration_id);
CREATE INDEX idx_canvas_designs_product_id ON public.canvas_designs(product_configuration_id);

-- Create trigger for updating timestamps
CREATE TRIGGER update_product_configurations_updated_at
  BEFORE UPDATE ON public.product_configurations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_product_details_updated_at
  BEFORE UPDATE ON public.product_details
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_canvas_designs_updated_at
  BEFORE UPDATE ON public.canvas_designs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
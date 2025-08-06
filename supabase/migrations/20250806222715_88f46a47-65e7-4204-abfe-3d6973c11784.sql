-- Create job_statuses table for dynamic status management
CREATE TABLE public.job_statuses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT 'blue',
  category TEXT NOT NULL DEFAULT 'Quote',
  action TEXT NOT NULL DEFAULT 'editable',
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.job_statuses ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own job statuses" 
ON public.job_statuses 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own job statuses" 
ON public.job_statuses 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own job statuses" 
ON public.job_statuses 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own job statuses" 
ON public.job_statuses 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_job_statuses_updated_at
BEFORE UPDATE ON public.job_statuses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default job statuses for existing users
INSERT INTO public.job_statuses (user_id, name, color, category, action, description, sort_order, is_active) 
SELECT 
  user_id,
  'Draft',
  'gray',
  'Quote',
  'editable',
  'Initial quote creation',
  1,
  true
FROM public.user_profiles
ON CONFLICT DO NOTHING;

INSERT INTO public.job_statuses (user_id, name, color, category, action, description, sort_order, is_active) 
SELECT 
  user_id,
  'Sent',
  'blue',
  'Quote',
  'view_only',
  'Quote sent to client',
  2,
  true
FROM public.user_profiles
ON CONFLICT DO NOTHING;

INSERT INTO public.job_statuses (user_id, name, color, category, action, description, sort_order, is_active) 
SELECT 
  user_id,
  'Approved',
  'green',
  'Project',
  'progress_only',
  'Quote approved, project in progress',
  3,
  true
FROM public.user_profiles
ON CONFLICT DO NOTHING;

INSERT INTO public.job_statuses (user_id, name, color, category, action, description, sort_order, is_active) 
SELECT 
  user_id,
  'Completed',
  'green',
  'Project',
  'locked',
  'Project completed',
  4,
  true
FROM public.user_profiles
ON CONFLICT DO NOTHING;

INSERT INTO public.job_statuses (user_id, name, color, category, action, description, sort_order, is_active) 
SELECT 
  user_id,
  'Cancelled',
  'red',
  'Quote',
  'locked',
  'Quote or project cancelled',
  5,
  true
FROM public.user_profiles
ON CONFLICT DO NOTHING;
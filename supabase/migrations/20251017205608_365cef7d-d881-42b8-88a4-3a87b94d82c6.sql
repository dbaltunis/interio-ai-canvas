-- Create lead_sources table for custom lead source management
CREATE TABLE IF NOT EXISTS public.lead_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  color TEXT DEFAULT '#3b82f6',
  icon TEXT DEFAULT 'tag',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, name)
);

-- Enable RLS
ALTER TABLE public.lead_sources ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own lead sources"
  ON public.lead_sources
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own lead sources"
  ON public.lead_sources
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lead sources"
  ON public.lead_sources
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lead sources"
  ON public.lead_sources
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_lead_sources_updated_at
  BEFORE UPDATE ON public.lead_sources
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default lead sources for existing users
INSERT INTO public.lead_sources (user_id, name, description, color, icon, sort_order)
SELECT 
  id as user_id,
  unnest(ARRAY['Website', 'Referral', 'Social Media', 'Advertisement', 'Trade Show', 'Cold Call', 'Email Campaign', 'Other']) as name,
  unnest(ARRAY['Website inquiries', 'Customer referrals', 'Social media channels', 'Paid advertising', 'Trade show leads', 'Cold outreach', 'Email marketing', 'Other sources']) as description,
  unnest(ARRAY['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4', '#6366f1', '#6b7280']) as color,
  unnest(ARRAY['globe', 'users', 'share-2', 'megaphone', 'briefcase', 'phone', 'mail', 'tag']) as icon,
  unnest(ARRAY[1, 2, 3, 4, 5, 6, 7, 8]) as sort_order
FROM auth.users
ON CONFLICT (user_id, name) DO NOTHING;
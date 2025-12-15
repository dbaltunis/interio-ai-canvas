-- Create dashboard_preferences table to store user KPI and widget settings
CREATE TABLE IF NOT EXISTS public.dashboard_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kpi_configs JSONB DEFAULT '[]'::jsonb,
  widget_configs JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.dashboard_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies - users can only access their own preferences
CREATE POLICY "Users can view own dashboard preferences"
ON public.dashboard_preferences
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own dashboard preferences"
ON public.dashboard_preferences
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own dashboard preferences"
ON public.dashboard_preferences
FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_dashboard_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_dashboard_preferences_timestamp
  BEFORE UPDATE ON public.dashboard_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_dashboard_preferences_updated_at();

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_dashboard_preferences_user_id ON public.dashboard_preferences(user_id);
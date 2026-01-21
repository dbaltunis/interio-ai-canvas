-- Create client_stages table for customizable funnel stages
CREATE TABLE public.client_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  label TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT 'gray',
  description TEXT,
  slot_number INTEGER NOT NULL CHECK (slot_number >= 1 AND slot_number <= 10),
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, slot_number),
  UNIQUE(user_id, name)
);

-- Enable RLS
ALTER TABLE public.client_stages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own client stages"
  ON public.client_stages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own client stages"
  ON public.client_stages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own client stages"
  ON public.client_stages FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own client stages"
  ON public.client_stages FOR DELETE
  USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER update_client_stages_updated_at
  BEFORE UPDATE ON public.client_stages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_client_stages_user_id ON public.client_stages(user_id);
CREATE INDEX idx_client_stages_slot ON public.client_stages(user_id, slot_number);
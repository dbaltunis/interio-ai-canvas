-- Create client_lists table for organizing contacts into groups
CREATE TABLE public.client_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'static' CHECK (type IN ('static', 'smart')),
  filters JSONB DEFAULT '{}'::jsonb,
  color TEXT DEFAULT '#6366f1',
  icon TEXT DEFAULT 'users',
  member_count INTEGER DEFAULT 0,
  last_email_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create client_list_members junction table
CREATE TABLE public.client_list_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID NOT NULL REFERENCES public.client_lists(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(list_id, client_id)
);

-- Enable RLS
ALTER TABLE public.client_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_list_members ENABLE ROW LEVEL SECURITY;

-- RLS policies for client_lists
CREATE POLICY "Users can view their own client lists"
ON public.client_lists FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own client lists"
ON public.client_lists FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own client lists"
ON public.client_lists FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own client lists"
ON public.client_lists FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for client_list_members (through list ownership)
CREATE POLICY "Users can view members of their lists"
ON public.client_list_members FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.client_lists
    WHERE client_lists.id = client_list_members.list_id
    AND client_lists.user_id = auth.uid()
  )
);

CREATE POLICY "Users can add members to their lists"
ON public.client_list_members FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.client_lists
    WHERE client_lists.id = client_list_members.list_id
    AND client_lists.user_id = auth.uid()
  )
);

CREATE POLICY "Users can remove members from their lists"
ON public.client_list_members FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.client_lists
    WHERE client_lists.id = client_list_members.list_id
    AND client_lists.user_id = auth.uid()
  )
);

-- Function to update member count
CREATE OR REPLACE FUNCTION public.update_client_list_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.client_lists
    SET member_count = member_count + 1, updated_at = now()
    WHERE id = NEW.list_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.client_lists
    SET member_count = member_count - 1, updated_at = now()
    WHERE id = OLD.list_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to auto-update member count
CREATE TRIGGER update_list_member_count
AFTER INSERT OR DELETE ON public.client_list_members
FOR EACH ROW
EXECUTE FUNCTION public.update_client_list_member_count();

-- Indexes for performance
CREATE INDEX idx_client_lists_user_id ON public.client_lists(user_id);
CREATE INDEX idx_client_list_members_list_id ON public.client_list_members(list_id);
CREATE INDEX idx_client_list_members_client_id ON public.client_list_members(client_id);
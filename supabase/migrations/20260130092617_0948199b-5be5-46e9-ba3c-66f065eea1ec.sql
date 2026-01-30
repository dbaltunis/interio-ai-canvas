-- Create client_inquiries table to store all form submissions with full message history
CREATE TABLE IF NOT EXISTS public.client_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  inquiry_type TEXT NOT NULL DEFAULT 'general',
  message TEXT NOT NULL,
  source TEXT DEFAULT 'website',
  metadata JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.client_inquiries ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users see inquiries for their own clients (using effective account owner for team members)
CREATE POLICY "Users can view own client inquiries"
  ON public.client_inquiries
  FOR SELECT
  USING (user_id = public.get_effective_account_owner(auth.uid()));

-- RLS Policy: Users can update their own inquiries (mark as read)
CREATE POLICY "Users can update own client inquiries"
  ON public.client_inquiries
  FOR UPDATE
  USING (user_id = public.get_effective_account_owner(auth.uid()))
  WITH CHECK (user_id = public.get_effective_account_owner(auth.uid()));

-- RLS Policy: Allow insert for authenticated users
CREATE POLICY "Authenticated users can insert inquiries"
  ON public.client_inquiries
  FOR INSERT
  WITH CHECK (true);

-- Indexes for performance
CREATE INDEX idx_client_inquiries_client_id ON public.client_inquiries(client_id);
CREATE INDEX idx_client_inquiries_user_id ON public.client_inquiries(user_id);
CREATE INDEX idx_client_inquiries_is_read ON public.client_inquiries(is_read) WHERE is_read = false;
CREATE INDEX idx_client_inquiries_created_at ON public.client_inquiries(created_at DESC);

-- Add trigger for updated_at
CREATE TRIGGER update_client_inquiries_updated_at
  BEFORE UPDATE ON public.client_inquiries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Migrate existing notes from clients table to client_inquiries
-- This ensures we don't lose any existing data
INSERT INTO public.client_inquiries (client_id, user_id, inquiry_type, message, source, is_read, created_at)
SELECT 
  id as client_id,
  user_id,
  'general' as inquiry_type,
  notes as message,
  COALESCE(source, 'website') as source,
  true as is_read,  -- Mark migrated inquiries as already read
  created_at
FROM public.clients 
WHERE notes IS NOT NULL AND notes != '';
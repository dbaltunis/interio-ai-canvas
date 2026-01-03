-- WhatsApp User Settings for BYOA (Bring Your Own Account)
CREATE TABLE public.whatsapp_user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  use_own_account BOOLEAN DEFAULT false,
  account_sid TEXT,
  auth_token TEXT,
  whatsapp_number TEXT,
  verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.whatsapp_user_settings ENABLE ROW LEVEL SECURITY;

-- Users can view their own settings
CREATE POLICY "Users can view own whatsapp settings"
ON public.whatsapp_user_settings
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own settings
CREATE POLICY "Users can insert own whatsapp settings"
ON public.whatsapp_user_settings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own settings
CREATE POLICY "Users can update own whatsapp settings"
ON public.whatsapp_user_settings
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own settings
CREATE POLICY "Users can delete own whatsapp settings"
ON public.whatsapp_user_settings
FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_whatsapp_user_settings_updated_at
BEFORE UPDATE ON public.whatsapp_user_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- WhatsApp Incoming Messages for Inbox feature
CREATE TABLE public.whatsapp_incoming_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  from_number TEXT NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  message_body TEXT,
  media_url TEXT,
  twilio_message_sid TEXT UNIQUE,
  received_at TIMESTAMPTZ DEFAULT now(),
  read BOOLEAN DEFAULT false,
  replied BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.whatsapp_incoming_messages ENABLE ROW LEVEL SECURITY;

-- Policy for viewing incoming messages (account owner and team members)
CREATE POLICY "Users can view incoming whatsapp messages"
ON public.whatsapp_incoming_messages
FOR SELECT
USING (
  account_owner_id = auth.uid() OR
  account_owner_id = (SELECT COALESCE(parent_account_id, user_id) FROM public.user_profiles WHERE user_id = auth.uid())
);

-- Policy for updating (marking as read)
CREATE POLICY "Users can update incoming whatsapp messages"
ON public.whatsapp_incoming_messages
FOR UPDATE
USING (
  account_owner_id = auth.uid() OR
  account_owner_id = (SELECT COALESCE(parent_account_id, user_id) FROM public.user_profiles WHERE user_id = auth.uid())
);

-- Index for faster phone number lookups
CREATE INDEX idx_whatsapp_incoming_from_number ON public.whatsapp_incoming_messages(from_number);
CREATE INDEX idx_whatsapp_incoming_account_owner ON public.whatsapp_incoming_messages(account_owner_id);

-- Index on clients.phone for matching incoming numbers
CREATE INDEX IF NOT EXISTS idx_clients_phone ON public.clients(phone) WHERE phone IS NOT NULL;
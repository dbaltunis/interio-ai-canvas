-- Create table for storing user payment provider connections
CREATE TABLE IF NOT EXISTS public.payment_provider_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('stripe', 'paypal')),
  stripe_account_id TEXT,
  stripe_access_token TEXT,
  stripe_refresh_token TEXT,
  stripe_scope TEXT,
  paypal_merchant_id TEXT,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, provider)
);

-- Enable RLS
ALTER TABLE public.payment_provider_connections ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own payment connections"
  ON public.payment_provider_connections
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payment connections"
  ON public.payment_provider_connections
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payment connections"
  ON public.payment_provider_connections
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own payment connections"
  ON public.payment_provider_connections
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER update_payment_provider_connections_updated_at
  BEFORE UPDATE ON public.payment_provider_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_payment_provider_connections_user_provider 
  ON public.payment_provider_connections(user_id, provider);
-- Add per-job custom markup override to quotes
ALTER TABLE public.quotes
ADD COLUMN IF NOT EXISTS custom_markup_percentage numeric DEFAULT NULL;

COMMENT ON COLUMN public.quotes.custom_markup_percentage IS
  'Per-job markup override. Null = use global settings. Negative = discount. Overrides all other markup levels.';

-- Create payment_records table for audit trail of individual payments
CREATE TABLE IF NOT EXISTS public.payment_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id uuid NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  amount numeric NOT NULL,
  payment_method text DEFAULT 'manual',
  reference text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for fast lookups by quote
CREATE INDEX IF NOT EXISTS idx_payment_records_quote_id ON public.payment_records(quote_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_created_at ON public.payment_records(created_at DESC);

-- Enable RLS
ALTER TABLE public.payment_records ENABLE ROW LEVEL SECURITY;

-- RLS policy: users can see payment records for their own quotes
CREATE POLICY "Users can view their payment records" ON public.payment_records
  FOR SELECT USING (
    user_id = auth.uid() OR
    quote_id IN (
      SELECT q.id FROM public.quotes q
      JOIN public.projects p ON q.project_id = p.id
      WHERE p.user_id = auth.uid()
    )
  );

-- RLS policy: users can insert payment records
CREATE POLICY "Users can create payment records" ON public.payment_records
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Create custom_invoices table for manual/partner invoices
CREATE TABLE public.custom_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'GBP',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  paid_at TIMESTAMPTZ,
  stripe_invoice_id TEXT,
  hosted_url TEXT,
  pdf_url TEXT,
  payment_type TEXT NOT NULL DEFAULT 'custom' CHECK (payment_type IN ('setup', 'subscription', 'custom')),
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.custom_invoices ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own invoices OR their parent account's invoices (team member inheritance)
CREATE POLICY "Users can view own or parent account invoices"
ON public.custom_invoices
FOR SELECT
USING (
  user_id = auth.uid()
  OR user_id IN (
    SELECT parent_account_id FROM public.user_profiles WHERE user_id = auth.uid() AND parent_account_id IS NOT NULL
  )
);

-- Policy: Only admins (via service role) can insert/update/delete
CREATE POLICY "Service role can manage all invoices"
ON public.custom_invoices
FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- Create index for faster queries
CREATE INDEX idx_custom_invoices_user_id ON public.custom_invoices(user_id);
CREATE INDEX idx_custom_invoices_status ON public.custom_invoices(status);

-- Trigger for updated_at
CREATE TRIGGER update_custom_invoices_updated_at
BEFORE UPDATE ON public.custom_invoices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Activate the "All-In Custom" plan
UPDATE public.subscription_plans
SET is_active = true, updated_at = now()
WHERE id = 'd1b3e66f-4e86-4302-ba71-538d843a2742';
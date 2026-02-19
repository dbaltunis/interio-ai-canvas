ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS rfms_customer_id TEXT;

CREATE INDEX IF NOT EXISTS idx_clients_rfms_customer_id ON public.clients(rfms_customer_id);

NOTIFY pgrst, 'reload schema';
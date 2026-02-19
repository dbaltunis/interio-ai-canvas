ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS rfms_quote_id TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS rfms_order_id TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS netsuite_estimate_id TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS netsuite_sales_order_id TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS netsuite_invoice_id TEXT;

CREATE INDEX IF NOT EXISTS idx_projects_rfms_quote_id ON public.projects(rfms_quote_id);

NOTIFY pgrst, 'reload schema';
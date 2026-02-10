-- Add external system ID columns for RFMS and NetSuite integration

-- RFMS customer linking
ALTER TABLE clients ADD COLUMN IF NOT EXISTS rfms_customer_id text;
CREATE INDEX IF NOT EXISTS idx_clients_rfms_customer_id ON clients(rfms_customer_id) WHERE rfms_customer_id IS NOT NULL;

-- NetSuite customer linking
ALTER TABLE clients ADD COLUMN IF NOT EXISTS netsuite_customer_id text;
CREATE INDEX IF NOT EXISTS idx_clients_netsuite_customer_id ON clients(netsuite_customer_id) WHERE netsuite_customer_id IS NOT NULL;

-- RFMS quote/order linking on projects
ALTER TABLE projects ADD COLUMN IF NOT EXISTS rfms_quote_id text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS rfms_order_id text;
CREATE INDEX IF NOT EXISTS idx_projects_rfms_quote_id ON projects(rfms_quote_id) WHERE rfms_quote_id IS NOT NULL;

-- NetSuite estimate/sales order linking on projects
ALTER TABLE projects ADD COLUMN IF NOT EXISTS netsuite_estimate_id text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS netsuite_sales_order_id text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS netsuite_invoice_id text;
CREATE INDEX IF NOT EXISTS idx_projects_netsuite_estimate_id ON projects(netsuite_estimate_id) WHERE netsuite_estimate_id IS NOT NULL;

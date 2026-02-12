-- Make batch_orders.supplier_id nullable to support integration-based orders
-- (TWC, RFMS, CW Systems, Norman) where the supplier is an integration, not a vendor row.
-- Also add integration_type + supplier_name columns for integration-based orders.

ALTER TABLE batch_orders
  ALTER COLUMN supplier_id DROP NOT NULL;

-- Add integration_type column to identify which integration this order is for
-- when supplier_id is NULL (e.g., 'twc', 'rfms', 'cw_systems', 'norman_australia')
ALTER TABLE batch_orders
  ADD COLUMN IF NOT EXISTS integration_type TEXT;

-- Add supplier_name for display purposes (populated from vendor name or integration name)
ALTER TABLE batch_orders
  ADD COLUMN IF NOT EXISTS supplier_name TEXT;

-- Add order_method to track how the order was submitted (api, email, portal, phone, fax)
ALTER TABLE batch_orders
  ADD COLUMN IF NOT EXISTS order_method TEXT DEFAULT 'email';

-- Add purchase_order_ref for PO number tracking (industry standard field for RFMS/NetSuite)
ALTER TABLE batch_orders
  ADD COLUMN IF NOT EXISTS purchase_order_ref TEXT;

-- Also make supplier_lead_times.supplier_id nullable for integration-based tracking
ALTER TABLE supplier_lead_times
  ALTER COLUMN supplier_id DROP NOT NULL;

ALTER TABLE supplier_lead_times
  ADD COLUMN IF NOT EXISTS integration_type TEXT;

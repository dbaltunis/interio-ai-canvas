-- Update foreign key references to use vendors instead of suppliers

-- Drop existing foreign keys and recreate with vendors
ALTER TABLE material_order_queue 
  DROP CONSTRAINT IF EXISTS material_order_queue_supplier_id_fkey,
  ADD CONSTRAINT material_order_queue_vendor_id_fkey 
    FOREIGN KEY (supplier_id) REFERENCES vendors(id);

ALTER TABLE batch_orders 
  DROP CONSTRAINT IF EXISTS batch_orders_supplier_id_fkey,
  ADD CONSTRAINT batch_orders_vendor_id_fkey 
    FOREIGN KEY (supplier_id) REFERENCES vendors(id);

ALTER TABLE supplier_lead_times 
  DROP CONSTRAINT IF EXISTS supplier_lead_times_supplier_id_fkey,
  ADD CONSTRAINT supplier_lead_times_vendor_id_fkey 
    FOREIGN KEY (supplier_id) REFERENCES vendors(id);

-- Add index for vendor lookups
CREATE INDEX IF NOT EXISTS idx_material_queue_vendor ON material_order_queue(supplier_id);
CREATE INDEX IF NOT EXISTS idx_batch_orders_vendor ON batch_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_lead_times_vendor ON supplier_lead_times(supplier_id);

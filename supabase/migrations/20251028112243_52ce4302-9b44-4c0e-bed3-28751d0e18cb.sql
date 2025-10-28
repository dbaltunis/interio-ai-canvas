-- Add RLS policies for material_order_queue
CREATE POLICY "Users can view their own material queue items"
ON material_order_queue FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own material queue items"
ON material_order_queue FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own material queue items"
ON material_order_queue FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own material queue items"
ON material_order_queue FOR DELETE
USING (user_id = auth.uid());

-- Add RLS policies for batch_orders
CREATE POLICY "Users can view their own batch orders"
ON batch_orders FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own batch orders"
ON batch_orders FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own batch orders"
ON batch_orders FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own batch orders"
ON batch_orders FOR DELETE
USING (user_id = auth.uid());

-- Add RLS policies for batch_order_items
CREATE POLICY "Users can view batch order items they own"
ON batch_order_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM batch_orders
    WHERE batch_orders.id = batch_order_items.batch_order_id
    AND batch_orders.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert batch order items they own"
ON batch_order_items FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM batch_orders
    WHERE batch_orders.id = batch_order_items.batch_order_id
    AND batch_orders.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update batch order items they own"
ON batch_order_items FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM batch_orders
    WHERE batch_orders.id = batch_order_items.batch_order_id
    AND batch_orders.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete batch order items they own"
ON batch_order_items FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM batch_orders
    WHERE batch_orders.id = batch_order_items.batch_order_id
    AND batch_orders.user_id = auth.uid()
  )
);

-- Add RLS policies for order_tracking_history
CREATE POLICY "Users can view tracking history for their orders"
ON order_tracking_history FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM batch_orders
    WHERE batch_orders.id = order_tracking_history.batch_order_id
    AND batch_orders.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert tracking history for their orders"
ON order_tracking_history FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM batch_orders
    WHERE batch_orders.id = order_tracking_history.batch_order_id
    AND batch_orders.user_id = auth.uid()
  )
);

-- Add RLS policies for supplier_lead_times
CREATE POLICY "Users can view supplier lead times"
ON supplier_lead_times FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert supplier lead times"
ON supplier_lead_times FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update supplier lead times"
ON supplier_lead_times FOR UPDATE
USING (user_id = auth.uid());

-- Add RLS policies for order_schedule_settings
CREATE POLICY "Users can view their order schedule settings"
ON order_schedule_settings FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their order schedule settings"
ON order_schedule_settings FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their order schedule settings"
ON order_schedule_settings FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their order schedule settings"
ON order_schedule_settings FOR DELETE
USING (user_id = auth.uid());
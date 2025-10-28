-- Add setting to control whether prices are shown to suppliers
-- Default to false for security (retailers typically don't share internal pricing)
ALTER TABLE order_schedule_settings 
ADD COLUMN IF NOT EXISTS show_prices_to_suppliers boolean DEFAULT false;

COMMENT ON COLUMN order_schedule_settings.show_prices_to_suppliers IS 'Whether to include pricing information when sending orders to suppliers. Default false as per retail industry practice.';
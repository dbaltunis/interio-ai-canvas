-- Add cost tracking columns to room_products for service markup pipeline
-- Mirrors the treatment pattern: cost_price → markup → selling_price (unit_price/total_price)
ALTER TABLE public.room_products
  ADD COLUMN IF NOT EXISTS cost_price NUMERIC,
  ADD COLUMN IF NOT EXISTS markup_percentage NUMERIC,
  ADD COLUMN IF NOT EXISTS markup_source TEXT;

COMMENT ON COLUMN public.room_products.cost_price IS 'Cost price before markup (for services with cost tracking)';
COMMENT ON COLUMN public.room_products.markup_percentage IS 'Markup percentage applied when product was added';
COMMENT ON COLUMN public.room_products.markup_source IS 'Source of markup resolution: category, global, grid, manual, etc.';

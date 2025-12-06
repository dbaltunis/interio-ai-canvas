-- Add columns for custom items to room_products table
ALTER TABLE public.room_products
ADD COLUMN IF NOT EXISTS name text,
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS image_url text,
ADD COLUMN IF NOT EXISTS is_custom boolean DEFAULT false;

-- Make inventory_item_id nullable for custom items
ALTER TABLE public.room_products
ALTER COLUMN inventory_item_id DROP NOT NULL;
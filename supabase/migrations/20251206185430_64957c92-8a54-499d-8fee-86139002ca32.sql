-- Create room_products table for storing products/services added to rooms
CREATE TABLE public.room_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  inventory_item_id UUID NOT NULL REFERENCES public.enhanced_inventory_items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  total_price NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_room_products_room_id ON public.room_products(room_id);
CREATE INDEX idx_room_products_user_id ON public.room_products(user_id);
CREATE INDEX idx_room_products_inventory_item_id ON public.room_products(inventory_item_id);

-- Enable RLS
ALTER TABLE public.room_products ENABLE ROW LEVEL SECURITY;

-- RLS policies for account isolation
CREATE POLICY "Users can view their own room products"
  ON public.room_products
  FOR SELECT
  USING (auth.uid() = user_id OR public.is_same_account(user_id));

CREATE POLICY "Users can create their own room products"
  ON public.room_products
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own room products"
  ON public.room_products
  FOR UPDATE
  USING (auth.uid() = user_id OR public.is_same_account(user_id));

CREATE POLICY "Users can delete their own room products"
  ON public.room_products
  FOR DELETE
  USING (auth.uid() = user_id OR public.is_same_account(user_id));

-- Trigger to update updated_at
CREATE TRIGGER update_room_products_updated_at
  BEFORE UPDATE ON public.room_products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
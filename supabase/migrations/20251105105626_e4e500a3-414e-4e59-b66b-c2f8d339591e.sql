-- Add missing fields to existing inventory_categories table
DO $$ 
BEGIN
  -- Add color field if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'inventory_categories' 
    AND column_name = 'color'
  ) THEN
    ALTER TABLE public.inventory_categories 
    ADD COLUMN color TEXT;
  END IF;

  -- Add icon field if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'inventory_categories' 
    AND column_name = 'icon'
  ) THEN
    ALTER TABLE public.inventory_categories 
    ADD COLUMN icon TEXT;
  END IF;
END $$;
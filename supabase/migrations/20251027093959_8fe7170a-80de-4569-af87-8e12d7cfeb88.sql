-- Update existing inventory_movements table to support our auto-deduction system
-- Add missing columns
ALTER TABLE public.inventory_movements 
ADD COLUMN IF NOT EXISTS item_table TEXT CHECK (item_table IN ('enhanced_inventory_items', 'fabrics', 'hardware_inventory', 'heading_inventory'));

ALTER TABLE public.inventory_movements 
ADD COLUMN IF NOT EXISTS item_name TEXT;

ALTER TABLE public.inventory_movements 
ADD COLUMN IF NOT EXISTS quantity_before DECIMAL(10, 2);

ALTER TABLE public.inventory_movements 
ADD COLUMN IF NOT EXISTS quantity_change DECIMAL(10, 2);

ALTER TABLE public.inventory_movements 
ADD COLUMN IF NOT EXISTS quantity_after DECIMAL(10, 2);

ALTER TABLE public.inventory_movements 
ADD COLUMN IF NOT EXISTS unit TEXT;

ALTER TABLE public.inventory_movements 
ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL;

ALTER TABLE public.inventory_movements 
ADD COLUMN IF NOT EXISTS surface_id UUID REFERENCES public.surfaces(id) ON DELETE SET NULL;

ALTER TABLE public.inventory_movements 
ADD COLUMN IF NOT EXISTS reason TEXT;

ALTER TABLE public.inventory_movements 
ADD COLUMN IF NOT EXISTS cost_impact DECIMAL(10, 2);

ALTER TABLE public.inventory_movements 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

ALTER TABLE public.inventory_movements 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Update movement_type constraint to include new types
ALTER TABLE public.inventory_movements DROP CONSTRAINT IF EXISTS inventory_movements_movement_type_check;
ALTER TABLE public.inventory_movements 
ADD CONSTRAINT inventory_movements_movement_type_check 
CHECK (movement_type IN ('deduction', 'addition', 'adjustment', 'waste', 'remnant_created', 'purchase', 'return'));

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_inventory_movements_inventory_id ON public.inventory_movements(inventory_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_project ON public.inventory_movements(project_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_created_at ON public.inventory_movements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_movement_type ON public.inventory_movements(movement_type);

-- Add comment
COMMENT ON TABLE public.inventory_movements IS 'Tracks all inventory quantity changes including deductions, additions, and adjustments';
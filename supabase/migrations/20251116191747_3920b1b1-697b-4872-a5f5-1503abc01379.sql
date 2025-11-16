-- Create collections table
CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  season TEXT,
  year INTEGER,
  tags TEXT[],
  image_url TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies for collections
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view account collections"
  ON collections FOR SELECT
  USING (get_account_owner(auth.uid()) = get_account_owner(user_id));

CREATE POLICY "Users can create collections"
  ON collections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update collections"
  ON collections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete collections"
  ON collections FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_collections_user_id ON collections(user_id);
CREATE INDEX idx_collections_vendor_id ON collections(vendor_id);
CREATE INDEX idx_collections_active ON collections(active);

-- Add collection_id to enhanced_inventory_items
ALTER TABLE enhanced_inventory_items 
ADD COLUMN IF NOT EXISTS collection_id UUID REFERENCES collections(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_inventory_collection_id ON enhanced_inventory_items(collection_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_collections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_collections_updated_at
  BEFORE UPDATE ON collections
  FOR EACH ROW
  EXECUTE FUNCTION update_collections_updated_at();
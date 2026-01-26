-- Make vendor_id optional for collections (allows custom/internal collections)
ALTER TABLE collections ALTER COLUMN vendor_id DROP NOT NULL;
-- Set remaining 3 collections with no linked items to "Kolekcija" (Lithuanian for "Collection")
UPDATE collections
SET description = 'Kolekcija'
WHERE user_id = '32a92783-f482-4e3d-8ebf-c292200674e5'
  AND description = 'Auto-created from fabric imports';
-- Remove avatar_url column from clients table
ALTER TABLE clients DROP COLUMN IF EXISTS avatar_url;

-- Delete all objects from client-avatars bucket first
DELETE FROM storage.objects WHERE bucket_id = 'client-avatars';

-- Then delete the client-avatars storage bucket
DELETE FROM storage.buckets WHERE id = 'client-avatars';
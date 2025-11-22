-- Create storage bucket for client avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('client-avatars', 'client-avatars', true);

-- Add avatar_url column to clients table
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Enable RLS for client avatars bucket
CREATE POLICY "Client avatars are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'client-avatars');

CREATE POLICY "Users can upload their client avatars"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'client-avatars' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Users can update their client avatars"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'client-avatars' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Users can delete their client avatars"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'client-avatars' AND
  auth.uid() IS NOT NULL
);
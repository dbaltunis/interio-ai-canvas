-- Make client-files bucket private
UPDATE storage.buckets 
SET public = false 
WHERE id = 'client-files';

-- Make project-documents bucket private
UPDATE storage.buckets 
SET public = false 
WHERE id = 'project-documents';

-- Drop any public access policies for these buckets
DROP POLICY IF EXISTS "Public Access for client-files" ON storage.objects;
DROP POLICY IF EXISTS "Public can read project public buckets" ON storage.objects;

-- New policy: Authenticated users can read their own client files
CREATE POLICY "Users can read their client files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'client-files' 
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- New policy: Team members can read owner's client files
CREATE POLICY "Team members can read owner client files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'client-files'
  AND (public.get_effective_account_owner(auth.uid()))::text = (storage.foldername(name))[1]
);

-- New policy: Authenticated users can read project documents
CREATE POLICY "Users can read project documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'project-documents'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);
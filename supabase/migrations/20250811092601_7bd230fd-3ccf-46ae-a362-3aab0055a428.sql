-- Realtime for direct_messages and Storage policies for uploads

-- Ensure complete row data for updates
ALTER TABLE public.direct_messages REPLICA IDENTITY FULL;

-- Add direct_messages to realtime publication if not already present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = 'direct_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.direct_messages;
  END IF;
EXCEPTION WHEN undefined_table THEN
  -- Table may not exist in some environments; ignore
  NULL;
END $$;

-- Storage policies for project-documents and project-images
-- Public read access for public buckets
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public can read project public buckets'
  ) THEN
    CREATE POLICY "Public can read project public buckets"
      ON storage.objects
      FOR SELECT
      USING (bucket_id IN ('project-documents','project-images'));
  END IF;
END $$;

-- Allow authenticated users to upload message files under messages/{auth.uid()}/...
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can upload message files'
  ) THEN
    CREATE POLICY "Users can upload message files"
      ON storage.objects
      FOR INSERT TO authenticated
      WITH CHECK (
        bucket_id = 'project-documents'
        AND (storage.foldername(name))[1] = 'messages'
        AND (storage.foldername(name))[2] = auth.uid()::text
      );
  END IF;
END $$;

-- Allow updates to own message files
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can update own message files'
  ) THEN
    CREATE POLICY "Users can update own message files"
      ON storage.objects
      FOR UPDATE TO authenticated
      USING (
        bucket_id = 'project-documents'
        AND (storage.foldername(name))[1] = 'messages'
        AND (storage.foldername(name))[2] = auth.uid()::text
      );
  END IF;
END $$;

-- Allow deletes of own message files
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can delete own message files'
  ) THEN
    CREATE POLICY "Users can delete own message files"
      ON storage.objects
      FOR DELETE TO authenticated
      USING (
        bucket_id = 'project-documents'
        AND (storage.foldername(name))[1] = 'messages'
        AND (storage.foldername(name))[2] = auth.uid()::text
      );
  END IF;
END $$;
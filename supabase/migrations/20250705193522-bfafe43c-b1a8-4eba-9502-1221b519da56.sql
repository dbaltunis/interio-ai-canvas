-- Create storage bucket for email attachments
INSERT INTO storage.buckets (id, name, public) 
VALUES ('email-attachments', 'email-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for email attachments
CREATE POLICY "Users can upload their own email attachments" ON "storage"."objects"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK ((bucket_id = 'email-attachments'::text) AND (auth.uid()::text = (storage.foldername(name))[1]));

CREATE POLICY "Users can view their own email attachments" ON "storage"."objects"
AS PERMISSIVE FOR SELECT
TO authenticated
USING ((bucket_id = 'email-attachments'::text) AND (auth.uid()::text = (storage.foldername(name))[1]));

CREATE POLICY "Users can delete their own email attachments" ON "storage"."objects"
AS PERMISSIVE FOR DELETE
TO authenticated
USING ((bucket_id = 'email-attachments'::text) AND (auth.uid()::text = (storage.foldername(name))[1]));
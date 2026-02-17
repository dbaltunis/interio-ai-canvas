-- Create storage bucket for imports
INSERT INTO storage.buckets (id, name, public) 
VALUES ('imports', 'imports', false)
ON CONFLICT (id) DO NOTHING;

-- Allow service role to manage files (the edge function uses service role key)
CREATE POLICY "Service role can manage imports" ON storage.objects
FOR ALL USING (bucket_id = 'imports') WITH CHECK (bucket_id = 'imports');

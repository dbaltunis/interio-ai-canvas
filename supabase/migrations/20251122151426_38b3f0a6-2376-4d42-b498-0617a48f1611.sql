-- Create client_files table to track file metadata and project associations
CREATE TABLE IF NOT EXISTS public.client_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT,
  bucket_name TEXT NOT NULL DEFAULT 'client-files',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.client_files ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own client files"
  ON public.client_files
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own client files"
  ON public.client_files
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own client files"
  ON public.client_files
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own client files"
  ON public.client_files
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX idx_client_files_client_id ON public.client_files(client_id);
CREATE INDEX idx_client_files_project_id ON public.client_files(project_id);
CREATE INDEX idx_client_files_user_id ON public.client_files(user_id);

-- Create updated_at trigger
CREATE TRIGGER update_client_files_updated_at
  BEFORE UPDATE ON public.client_files
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
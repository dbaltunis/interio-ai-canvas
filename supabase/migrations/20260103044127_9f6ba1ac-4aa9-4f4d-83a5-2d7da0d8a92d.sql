-- Add project_id column to whatsapp_message_logs for job/project tracking
ALTER TABLE public.whatsapp_message_logs 
ADD COLUMN IF NOT EXISTS project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL;

-- Create index for efficient project-based queries
CREATE INDEX IF NOT EXISTS idx_whatsapp_message_logs_project_id 
ON public.whatsapp_message_logs(project_id);

-- Create index for efficient client-based queries (if not exists)
CREATE INDEX IF NOT EXISTS idx_whatsapp_message_logs_client_id 
ON public.whatsapp_message_logs(client_id);
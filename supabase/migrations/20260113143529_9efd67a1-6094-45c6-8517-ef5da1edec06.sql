-- Add document type and content filter columns to projects table
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS work_order_document_type TEXT DEFAULT 'work_order',
ADD COLUMN IF NOT EXISTS work_order_content_filter JSONB DEFAULT '{"type": "all"}'::jsonb;

-- Add comment for clarity
COMMENT ON COLUMN public.projects.work_order_document_type IS 'Type of document shared: work_order, installation, fitting';
COMMENT ON COLUMN public.projects.work_order_content_filter IS 'Filter for shared content: {type: all|client_only|rooms, room_ids?: string[]}';
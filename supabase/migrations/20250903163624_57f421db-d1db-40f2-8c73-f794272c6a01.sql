-- Add canvas_data column to support enhanced template editor
ALTER TABLE public.quote_templates 
ADD COLUMN canvas_data JSONB;
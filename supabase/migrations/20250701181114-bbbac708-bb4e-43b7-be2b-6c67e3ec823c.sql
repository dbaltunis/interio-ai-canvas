
-- Add foreign key constraint to link assignments to categories
ALTER TABLE public.window_covering_option_assignments 
ADD CONSTRAINT fk_window_covering_option_assignments_category_id 
FOREIGN KEY (category_id) REFERENCES public.window_covering_option_categories(id) ON DELETE CASCADE;

-- Add foreign key constraint to link assignments to window coverings  
ALTER TABLE public.window_covering_option_assignments 
ADD CONSTRAINT fk_window_covering_option_assignments_window_covering_id 
FOREIGN KEY (window_covering_id) REFERENCES public.window_coverings(id) ON DELETE CASCADE;

-- Create hidden_option_categories table to track which system default option types users have hidden
CREATE TABLE IF NOT EXISTS public.hidden_option_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  option_type_category_id uuid NOT NULL REFERENCES public.option_type_categories(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, option_type_category_id)
);

-- Enable RLS
ALTER TABLE public.hidden_option_categories ENABLE ROW LEVEL SECURITY;

-- Users can only see their own hidden categories
CREATE POLICY "Users can view their own hidden categories"
  ON public.hidden_option_categories
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can hide categories for themselves
CREATE POLICY "Users can hide categories"
  ON public.hidden_option_categories
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can unhide their own categories
CREATE POLICY "Users can unhide categories"
  ON public.hidden_option_categories
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add index for performance
CREATE INDEX idx_hidden_option_categories_user_id ON public.hidden_option_categories(user_id);
CREATE INDEX idx_hidden_option_categories_option_type_id ON public.hidden_option_categories(option_type_category_id);
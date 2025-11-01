-- Create user feedback table
CREATE TABLE IF NOT EXISTS public.user_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('bug', 'feature_request', 'general', 'praise')),
  feature_area TEXT,
  description TEXT NOT NULL,
  conversation_context JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'in_progress', 'resolved')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own feedback"
  ON public.user_feedback FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own feedback"
  ON public.user_feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own feedback"
  ON public.user_feedback FOR UPDATE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_feedback_user_id ON public.user_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_user_feedback_status ON public.user_feedback(status);
CREATE INDEX IF NOT EXISTS idx_user_feedback_type ON public.user_feedback(feedback_type);

-- Trigger for updated_at
CREATE TRIGGER update_user_feedback_updated_at
  BEFORE UPDATE ON public.user_feedback
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
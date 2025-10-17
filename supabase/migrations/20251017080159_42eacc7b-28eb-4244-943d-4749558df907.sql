-- Create tasks table (replacing the confusing reminders system)
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  
  title TEXT NOT NULL,
  description TEXT,
  
  -- Task properties
  due_date TIMESTAMP WITH TIME ZONE,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  
  -- Assignment
  assigned_to UUID REFERENCES auth.users(id),
  
  -- Metadata
  tags TEXT[] DEFAULT '{}',
  estimated_hours NUMERIC,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Calendar sync
  calendar_synced BOOLEAN DEFAULT false,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tasks
CREATE POLICY "Users can view account tasks"
  ON public.tasks FOR SELECT
  USING (
    get_account_owner(auth.uid()) = get_account_owner(user_id)
    OR auth.uid() = assigned_to
  );

CREATE POLICY "Users can create tasks"
  ON public.tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their tasks"
  ON public.tasks FOR UPDATE
  USING (
    auth.uid() = user_id 
    OR auth.uid() = assigned_to
    OR get_account_owner(auth.uid()) = get_account_owner(user_id)
  );

CREATE POLICY "Users can delete their tasks"
  ON public.tasks FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX idx_tasks_client_id ON public.tasks(client_id);
CREATE INDEX idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_assigned_to ON public.tasks(assigned_to);

-- Trigger for updated_at
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-log activity when task is completed
CREATE OR REPLACE FUNCTION log_task_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log when status changes to completed
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.completed_at = NOW();
    
    -- Log to activity if there's a client
    IF NEW.client_id IS NOT NULL THEN
      INSERT INTO public.client_activity_log (
        client_id,
        user_id,
        activity_type,
        title,
        description,
        metadata
      ) VALUES (
        NEW.client_id,
        NEW.user_id,
        'task_completed',
        'Task Completed: ' || NEW.title,
        NEW.description,
        jsonb_build_object(
          'task_id', NEW.id,
          'priority', NEW.priority,
          'completed_at', NEW.completed_at
        )
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER task_completion_logger
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION log_task_completion();

-- Migrate existing reminders to tasks
INSERT INTO public.tasks (
  id,
  user_id,
  client_id,
  title,
  description,
  due_date,
  status,
  created_at
)
SELECT 
  id,
  user_id,
  client_id,
  COALESCE(message, 'Follow-up') as title,
  'Migrated from reminders' as description,
  scheduled_for as due_date,
  CASE 
    WHEN status = 'dismissed' THEN 'completed'
    ELSE 'pending'
  END as status,
  created_at
FROM public.follow_up_reminders
ON CONFLICT (id) DO NOTHING;
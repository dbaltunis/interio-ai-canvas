-- Phase 3: Marketing Automation

-- Create email sequences table
CREATE TABLE public.email_sequences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('lead_created', 'stage_change', 'time_based', 'manual', 'behavior')),
  trigger_conditions JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  sequence_delay_days INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create email sequence steps table
CREATE TABLE public.email_sequence_steps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sequence_id UUID NOT NULL,
  step_number INTEGER NOT NULL,
  delay_days INTEGER DEFAULT 0,
  delay_hours INTEGER DEFAULT 0,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  template_id UUID,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create automation workflows table
CREATE TABLE public.automation_workflows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  trigger_event TEXT NOT NULL,
  trigger_conditions JSONB DEFAULT '{}',
  actions JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  execution_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create automation executions table (for tracking and debugging)
CREATE TABLE public.automation_executions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id UUID NOT NULL,
  client_id UUID,
  deal_id UUID,
  trigger_data JSONB DEFAULT '{}',
  execution_status TEXT DEFAULT 'pending' CHECK (execution_status IN ('pending', 'running', 'completed', 'failed')),
  error_message TEXT,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create scheduled tasks table
CREATE TABLE public.scheduled_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  client_id UUID,
  deal_id UUID,
  task_type TEXT NOT NULL,
  task_data JSONB DEFAULT '{}',
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled', 'failed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create follow-up reminders table
CREATE TABLE public.follow_up_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  client_id UUID NOT NULL,
  deal_id UUID,
  reminder_type TEXT NOT NULL,
  message TEXT NOT NULL,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'dismissed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.email_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_sequence_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_up_reminders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for email sequences
CREATE POLICY "Users can manage account email sequences" 
ON public.email_sequences 
FOR ALL 
USING (get_account_owner(auth.uid()) = get_account_owner(user_id))
WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for email sequence steps
CREATE POLICY "Users can manage account email sequence steps" 
ON public.email_sequence_steps 
FOR ALL 
USING (sequence_id IN (
  SELECT id FROM public.email_sequences 
  WHERE get_account_owner(auth.uid()) = get_account_owner(user_id)
));

-- Create RLS policies for automation workflows
CREATE POLICY "Users can manage account automation workflows" 
ON public.automation_workflows 
FOR ALL 
USING (get_account_owner(auth.uid()) = get_account_owner(user_id))
WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for automation executions
CREATE POLICY "Users can view account automation executions" 
ON public.automation_executions 
FOR SELECT 
USING (workflow_id IN (
  SELECT id FROM public.automation_workflows 
  WHERE get_account_owner(auth.uid()) = get_account_owner(user_id)
));

-- Create RLS policies for scheduled tasks
CREATE POLICY "Users can manage account scheduled tasks" 
ON public.scheduled_tasks 
FOR ALL 
USING (get_account_owner(auth.uid()) = get_account_owner(user_id))
WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for follow-up reminders
CREATE POLICY "Users can manage account follow-up reminders" 
ON public.follow_up_reminders 
FOR ALL 
USING (get_account_owner(auth.uid()) = get_account_owner(user_id))
WITH CHECK (auth.uid() = user_id);

-- Add foreign key constraints
ALTER TABLE public.email_sequence_steps ADD CONSTRAINT email_sequence_steps_sequence_id_fkey 
FOREIGN KEY (sequence_id) REFERENCES public.email_sequences(id) ON DELETE CASCADE;

ALTER TABLE public.automation_executions ADD CONSTRAINT automation_executions_workflow_id_fkey 
FOREIGN KEY (workflow_id) REFERENCES public.automation_workflows(id) ON DELETE CASCADE;

ALTER TABLE public.follow_up_reminders ADD CONSTRAINT follow_up_reminders_client_id_fkey 
FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;

-- Create function to trigger automation workflows
CREATE OR REPLACE FUNCTION public.trigger_automation_workflow(
  event_type TEXT,
  entity_id UUID,
  entity_type TEXT DEFAULT 'client',
  event_data JSONB DEFAULT '{}'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  workflow_record RECORD;
  client_record RECORD;
  deal_record RECORD;
BEGIN
  -- Get entity details based on type
  IF entity_type = 'client' THEN
    SELECT * INTO client_record FROM public.clients WHERE id = entity_id;
  ELSIF entity_type = 'deal' THEN
    SELECT * INTO deal_record FROM public.deals WHERE id = entity_id;
    SELECT * INTO client_record FROM public.clients WHERE id = deal_record.client_id;
  END IF;

  -- Find matching workflows
  FOR workflow_record IN 
    SELECT * FROM public.automation_workflows 
    WHERE trigger_event = event_type 
    AND is_active = true
    AND (client_record.user_id = user_id OR deal_record.user_id = user_id)
  LOOP
    -- Create execution record
    INSERT INTO public.automation_executions (
      workflow_id,
      client_id,
      deal_id,
      trigger_data,
      execution_status
    ) VALUES (
      workflow_record.id,
      client_record.id,
      deal_record.id,
      event_data,
      'pending'
    );
    
    -- Update workflow execution count
    UPDATE public.automation_workflows 
    SET execution_count = execution_count + 1 
    WHERE id = workflow_record.id;
  END LOOP;
END;
$$;

-- Create function to schedule follow-up reminders
CREATE OR REPLACE FUNCTION public.schedule_follow_up_reminder(
  client_id_param UUID,
  deal_id_param UUID DEFAULT NULL,
  reminder_days INTEGER DEFAULT 3,
  reminder_type_param TEXT DEFAULT 'general_follow_up',
  custom_message TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  reminder_id UUID;
  client_record RECORD;
  deal_record RECORD;
  message_text TEXT;
  scheduled_time TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get client details
  SELECT * INTO client_record FROM public.clients WHERE id = client_id_param;
  
  -- Get deal details if provided
  IF deal_id_param IS NOT NULL THEN
    SELECT * INTO deal_record FROM public.deals WHERE id = deal_id_param;
  END IF;
  
  -- Calculate scheduled time
  scheduled_time := NOW() + (reminder_days || ' days')::INTERVAL;
  
  -- Generate message based on type
  IF custom_message IS NOT NULL THEN
    message_text := custom_message;
  ELSE
    CASE reminder_type_param
      WHEN 'general_follow_up' THEN
        message_text := 'Follow up with ' || COALESCE(client_record.company_name, client_record.name);
      WHEN 'deal_follow_up' THEN
        message_text := 'Follow up on deal: ' || COALESCE(deal_record.title, 'Unnamed deal');
      WHEN 'quote_reminder' THEN
        message_text := 'Send quote reminder to ' || COALESCE(client_record.company_name, client_record.name);
      WHEN 'proposal_follow_up' THEN
        message_text := 'Follow up on proposal with ' || COALESCE(client_record.company_name, client_record.name);
      ELSE
        message_text := 'Follow up with ' || COALESCE(client_record.company_name, client_record.name);
    END CASE;
  END IF;
  
  -- Insert reminder
  INSERT INTO public.follow_up_reminders (
    user_id,
    client_id,
    deal_id,
    reminder_type,
    message,
    scheduled_for
  ) VALUES (
    client_record.user_id,
    client_id_param,
    deal_id_param,
    reminder_type_param,
    message_text,
    scheduled_time
  ) RETURNING id INTO reminder_id;
  
  RETURN reminder_id;
END;
$$;

-- Create triggers for automation
CREATE OR REPLACE FUNCTION public.client_automation_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Trigger new lead automation
    PERFORM public.trigger_automation_workflow('lead_created', NEW.id, 'client', 
      jsonb_build_object(
        'lead_source', NEW.lead_source,
        'client_type', NEW.client_type,
        'lead_score', NEW.lead_score
      )
    );
    
    -- Schedule initial follow-up
    PERFORM public.schedule_follow_up_reminder(NEW.id, NULL, 1, 'new_lead_follow_up');
    
  ELSIF TG_OP = 'UPDATE' THEN
    -- Trigger stage change automation
    IF OLD.funnel_stage != NEW.funnel_stage THEN
      PERFORM public.trigger_automation_workflow('stage_change', NEW.id, 'client',
        jsonb_build_object(
          'old_stage', OLD.funnel_stage,
          'new_stage', NEW.funnel_stage,
          'client_type', NEW.client_type
        )
      );
    END IF;
    
    -- Trigger follow-up if follow_up_date is set
    IF NEW.follow_up_date IS NOT NULL AND (OLD.follow_up_date IS NULL OR OLD.follow_up_date != NEW.follow_up_date) THEN
      PERFORM public.schedule_follow_up_reminder(
        NEW.id, 
        NULL, 
        EXTRACT(DAYS FROM (NEW.follow_up_date - CURRENT_DATE))::INTEGER,
        'scheduled_follow_up'
      );
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger for deals automation
CREATE OR REPLACE FUNCTION public.deal_automation_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Trigger new deal automation
    PERFORM public.trigger_automation_workflow('deal_created', NEW.id, 'deal',
      jsonb_build_object(
        'deal_value', NEW.deal_value,
        'stage', NEW.stage,
        'probability', NEW.probability
      )
    );
    
    -- Schedule deal follow-up based on stage
    CASE NEW.stage
      WHEN 'qualification' THEN
        PERFORM public.schedule_follow_up_reminder(NEW.client_id, NEW.id, 2, 'deal_follow_up');
      WHEN 'proposal' THEN
        PERFORM public.schedule_follow_up_reminder(NEW.client_id, NEW.id, 5, 'proposal_follow_up');
      WHEN 'negotiation' THEN
        PERFORM public.schedule_follow_up_reminder(NEW.client_id, NEW.id, 1, 'deal_follow_up');
    END CASE;
    
  ELSIF TG_OP = 'UPDATE' THEN
    -- Trigger deal stage change automation
    IF OLD.stage != NEW.stage THEN
      PERFORM public.trigger_automation_workflow('deal_stage_change', NEW.id, 'deal',
        jsonb_build_object(
          'old_stage', OLD.stage,
          'new_stage', NEW.stage,
          'deal_value', NEW.deal_value,
          'probability', NEW.probability
        )
      );
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create triggers
CREATE TRIGGER client_automation_changes
  AFTER INSERT OR UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.client_automation_trigger();

CREATE TRIGGER deal_automation_changes
  AFTER INSERT OR UPDATE ON public.deals
  FOR EACH ROW
  EXECUTE FUNCTION public.deal_automation_trigger();

-- Add updated_at triggers
CREATE TRIGGER update_email_sequences_updated_at
  BEFORE UPDATE ON public.email_sequences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_automation_workflows_updated_at
  BEFORE UPDATE ON public.automation_workflows
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_email_sequences_user_id ON public.email_sequences(user_id);
CREATE INDEX idx_email_sequences_trigger_type ON public.email_sequences(trigger_type);
CREATE INDEX idx_email_sequence_steps_sequence_id ON public.email_sequence_steps(sequence_id);
CREATE INDEX idx_automation_workflows_user_id ON public.automation_workflows(user_id);
CREATE INDEX idx_automation_workflows_trigger_event ON public.automation_workflows(trigger_event);
CREATE INDEX idx_automation_executions_workflow_id ON public.automation_executions(workflow_id);
CREATE INDEX idx_automation_executions_client_id ON public.automation_executions(client_id);
CREATE INDEX idx_scheduled_tasks_user_id ON public.scheduled_tasks(user_id);
CREATE INDEX idx_scheduled_tasks_scheduled_for ON public.scheduled_tasks(scheduled_for);
CREATE INDEX idx_follow_up_reminders_user_id ON public.follow_up_reminders(user_id);
CREATE INDEX idx_follow_up_reminders_scheduled_for ON public.follow_up_reminders(scheduled_for);
CREATE INDEX idx_follow_up_reminders_client_id ON public.follow_up_reminders(client_id);
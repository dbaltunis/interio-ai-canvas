-- Fix trigger_automation_workflow function to handle null deal_record
CREATE OR REPLACE FUNCTION public.trigger_automation_workflow(event_type text, entity_id uuid, entity_type text DEFAULT 'client'::text, event_data jsonb DEFAULT '{}'::jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  workflow_record RECORD;
  client_record RECORD;
  deal_record RECORD;
  target_user_id UUID;
BEGIN
  -- Get entity details based on type
  IF entity_type = 'client' THEN
    SELECT * INTO client_record FROM public.clients WHERE id = entity_id;
    target_user_id := client_record.user_id;
  ELSIF entity_type = 'deal' THEN
    SELECT * INTO deal_record FROM public.deals WHERE id = entity_id;
    SELECT * INTO client_record FROM public.clients WHERE id = deal_record.client_id;
    target_user_id := deal_record.user_id;
  END IF;

  -- Find matching workflows
  FOR workflow_record IN 
    SELECT * FROM public.automation_workflows 
    WHERE trigger_event = event_type 
    AND is_active = true
    AND user_id = target_user_id
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
      COALESCE(client_record.id, NULL),
      COALESCE(deal_record.id, NULL),
      event_data,
      'pending'
    );
    
    -- Update workflow execution count
    UPDATE public.automation_workflows 
    SET execution_count = execution_count + 1 
    WHERE id = workflow_record.id;
  END LOOP;
END;
$function$;
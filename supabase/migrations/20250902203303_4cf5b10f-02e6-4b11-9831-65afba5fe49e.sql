-- Add lead intelligence fields to clients table
ALTER TABLE public.clients 
ADD COLUMN lead_score INTEGER DEFAULT 0,
ADD COLUMN lead_source TEXT,
ADD COLUMN lead_source_details JSONB DEFAULT '{}',
ADD COLUMN last_activity_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN conversion_probability INTEGER DEFAULT 0,
ADD COLUMN deal_value NUMERIC DEFAULT 0,
ADD COLUMN priority_level TEXT DEFAULT 'medium' CHECK (priority_level IN ('low', 'medium', 'high', 'urgent')),
ADD COLUMN follow_up_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN tags TEXT[] DEFAULT '{}',
ADD COLUMN marketing_consent BOOLEAN DEFAULT false,
ADD COLUMN referral_source TEXT,
ADD COLUMN assigned_to UUID;

-- Create lead scoring rules table
CREATE TABLE public.lead_scoring_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  rule_name TEXT NOT NULL,
  criteria JSONB NOT NULL,
  points INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lead_scoring_rules ENABLE ROW LEVEL SECURITY;

-- Create policies for lead scoring rules
CREATE POLICY "Users can view account lead scoring rules" 
ON public.lead_scoring_rules 
FOR SELECT 
USING (get_account_owner(auth.uid()) = get_account_owner(user_id));

CREATE POLICY "Users can create lead scoring rules" 
ON public.lead_scoring_rules 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR is_admin());

CREATE POLICY "Users can update lead scoring rules" 
ON public.lead_scoring_rules 
FOR UPDATE 
USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Users can delete lead scoring rules" 
ON public.lead_scoring_rules 
FOR DELETE 
USING (auth.uid() = user_id OR is_admin());

-- Create client interactions table for tracking all touchpoints
CREATE TABLE public.client_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  user_id UUID NOT NULL,
  interaction_type TEXT NOT NULL,
  interaction_details JSONB DEFAULT '{}',
  points_awarded INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.client_interactions ENABLE ROW LEVEL SECURITY;

-- Create policies for client interactions
CREATE POLICY "Users can view account client interactions" 
ON public.client_interactions 
FOR SELECT 
USING (get_account_owner(auth.uid()) = get_account_owner(user_id));

CREATE POLICY "Users can create client interactions" 
ON public.client_interactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update client interactions" 
ON public.client_interactions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to calculate lead score
CREATE OR REPLACE FUNCTION public.calculate_lead_score(client_id_param UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  total_score INTEGER := 0;
  rule_record RECORD;
  client_record RECORD;
  interaction_count INTEGER;
  days_since_created INTEGER;
  days_since_last_contact INTEGER;
BEGIN
  -- Get client data
  SELECT * INTO client_record FROM public.clients WHERE id = client_id_param;
  
  IF NOT FOUND THEN
    RETURN 0;
  END IF;
  
  -- Base scoring
  -- Email provided: +10 points
  IF client_record.email IS NOT NULL AND client_record.email != '' THEN
    total_score := total_score + 10;
  END IF;
  
  -- Phone provided: +10 points
  IF client_record.phone IS NOT NULL AND client_record.phone != '' THEN
    total_score := total_score + 10;
  END IF;
  
  -- B2B client: +15 points (typically higher value)
  IF client_record.client_type = 'B2B' THEN
    total_score := total_score + 15;
  END IF;
  
  -- Calculate interaction score
  SELECT COUNT(*) INTO interaction_count 
  FROM public.client_interactions 
  WHERE client_id = client_id_param;
  
  total_score := total_score + (interaction_count * 5);
  
  -- Time-based scoring
  days_since_created := EXTRACT(DAY FROM NOW() - client_record.created_at);
  
  -- Recent leads get bonus points
  IF days_since_created <= 7 THEN
    total_score := total_score + 20;
  ELSIF days_since_created <= 30 THEN
    total_score := total_score + 10;
  END IF;
  
  -- Penalty for old leads without recent contact
  IF client_record.last_contact_date IS NOT NULL THEN
    days_since_last_contact := EXTRACT(DAY FROM NOW() - client_record.last_contact_date);
    IF days_since_last_contact > 30 THEN
      total_score := total_score - 10;
    END IF;
  END IF;
  
  -- Apply custom scoring rules from lead_scoring_rules table
  FOR rule_record IN 
    SELECT * FROM public.lead_scoring_rules 
    WHERE user_id = client_record.user_id AND is_active = true
  LOOP
    -- Simple rule evaluation (can be expanded)
    IF rule_record.criteria->>'field' = 'funnel_stage' AND 
       rule_record.criteria->>'value' = client_record.funnel_stage THEN
      total_score := total_score + rule_record.points;
    END IF;
  END LOOP;
  
  -- Ensure minimum score of 0
  IF total_score < 0 THEN
    total_score := 0;
  END IF;
  
  RETURN total_score;
END;
$$;

-- Create trigger to auto-update lead scores
CREATE OR REPLACE FUNCTION public.update_lead_score_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  -- Update lead score
  NEW.lead_score := public.calculate_lead_score(NEW.id);
  
  -- Update last activity date on any change
  NEW.last_activity_date := NOW();
  
  RETURN NEW;
END;
$$;

-- Create triggers
CREATE TRIGGER update_client_lead_score
  BEFORE UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_lead_score_trigger();

-- Create trigger for new clients
CREATE TRIGGER insert_client_lead_score
  BEFORE INSERT ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_lead_score_trigger();

-- Add updated_at trigger to lead_scoring_rules
CREATE TRIGGER update_lead_scoring_rules_updated_at
  BEFORE UPDATE ON public.lead_scoring_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_clients_lead_score ON public.clients(lead_score DESC);
CREATE INDEX idx_clients_lead_source ON public.clients(lead_source);
CREATE INDEX idx_clients_priority_level ON public.clients(priority_level);
CREATE INDEX idx_clients_follow_up_date ON public.clients(follow_up_date);
CREATE INDEX idx_client_interactions_client_id ON public.client_interactions(client_id);
CREATE INDEX idx_client_interactions_type ON public.client_interactions(interaction_type);
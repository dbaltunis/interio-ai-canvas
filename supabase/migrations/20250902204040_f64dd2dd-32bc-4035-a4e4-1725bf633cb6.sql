-- Phase 2: Sales Pipeline Enhancement

-- Create deals/opportunities table
CREATE TABLE public.deals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  deal_value NUMERIC NOT NULL DEFAULT 0,
  probability INTEGER DEFAULT 50 CHECK (probability >= 0 AND probability <= 100),
  stage TEXT NOT NULL DEFAULT 'qualification' CHECK (stage IN ('qualification', 'needs_analysis', 'proposal', 'negotiation', 'closed_won', 'closed_lost')),
  expected_close_date DATE,
  actual_close_date DATE,
  source TEXT,
  competitor TEXT,
  loss_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

-- Create policies for deals
CREATE POLICY "Users can view account deals" 
ON public.deals 
FOR SELECT 
USING (get_account_owner(auth.uid()) = get_account_owner(user_id));

CREATE POLICY "Users can create deals" 
ON public.deals 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update deals" 
ON public.deals 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete deals" 
ON public.deals 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create sales forecast table
CREATE TABLE public.sales_forecasts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  forecast_period TEXT NOT NULL, -- 'monthly', 'quarterly', 'yearly'
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  forecasted_amount NUMERIC NOT NULL DEFAULT 0,
  actual_amount NUMERIC DEFAULT 0,
  deal_count INTEGER DEFAULT 0,
  confidence_level INTEGER DEFAULT 80 CHECK (confidence_level >= 0 AND confidence_level <= 100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sales_forecasts ENABLE ROW LEVEL SECURITY;

-- Create policies for sales forecasts
CREATE POLICY "Users can view account sales forecasts" 
ON public.sales_forecasts 
FOR SELECT 
USING (get_account_owner(auth.uid()) = get_account_owner(user_id));

CREATE POLICY "Users can manage sales forecasts" 
ON public.sales_forecasts 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create pipeline analytics table
CREATE TABLE public.pipeline_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  stage TEXT NOT NULL,
  total_deals INTEGER DEFAULT 0,
  total_value NUMERIC DEFAULT 0,
  avg_deal_size NUMERIC DEFAULT 0,
  conversion_rate NUMERIC DEFAULT 0,
  avg_time_in_stage INTERVAL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pipeline_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies for pipeline analytics
CREATE POLICY "Users can view account pipeline analytics" 
ON public.pipeline_analytics 
FOR SELECT 
USING (get_account_owner(auth.uid()) = get_account_owner(user_id));

CREATE POLICY "System can manage pipeline analytics" 
ON public.pipeline_analytics 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Function to calculate sales forecast
CREATE OR REPLACE FUNCTION public.calculate_sales_forecast(user_id_param UUID, period_start_param DATE, period_end_param DATE)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  forecasted_amount NUMERIC := 0;
  deal_record RECORD;
BEGIN
  -- Calculate forecast based on open deals within the period
  FOR deal_record IN 
    SELECT deal_value, probability, stage
    FROM public.deals 
    WHERE user_id = user_id_param 
    AND stage NOT IN ('closed_won', 'closed_lost')
    AND (expected_close_date BETWEEN period_start_param AND period_end_param
         OR expected_close_date IS NULL)
  LOOP
    -- Weighted probability based on stage
    CASE deal_record.stage
      WHEN 'qualification' THEN
        forecasted_amount := forecasted_amount + (deal_record.deal_value * (deal_record.probability * 0.6) / 100);
      WHEN 'needs_analysis' THEN
        forecasted_amount := forecasted_amount + (deal_record.deal_value * (deal_record.probability * 0.7) / 100);
      WHEN 'proposal' THEN
        forecasted_amount := forecasted_amount + (deal_record.deal_value * (deal_record.probability * 0.8) / 100);
      WHEN 'negotiation' THEN
        forecasted_amount := forecasted_amount + (deal_record.deal_value * (deal_record.probability * 0.9) / 100);
      ELSE
        forecasted_amount := forecasted_amount + (deal_record.deal_value * deal_record.probability / 100);
    END CASE;
  END LOOP;
  
  RETURN forecasted_amount;
END;
$$;

-- Function to update pipeline analytics
CREATE OR REPLACE FUNCTION public.update_pipeline_analytics(user_id_param UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  stage_record RECORD;
  current_period_start DATE := DATE_TRUNC('month', CURRENT_DATE);
  current_period_end DATE := (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month - 1 day')::DATE;
BEGIN
  -- Clear existing analytics for current period
  DELETE FROM public.pipeline_analytics 
  WHERE user_id = user_id_param 
  AND period_start = current_period_start 
  AND period_end = current_period_end;
  
  -- Calculate analytics for each stage
  FOR stage_record IN 
    SELECT 
      stage,
      COUNT(*) as deal_count,
      SUM(deal_value) as total_value,
      AVG(deal_value) as avg_deal_size
    FROM public.deals 
    WHERE user_id = user_id_param
    AND created_at >= current_period_start
    AND created_at <= current_period_end + INTERVAL '1 day'
    GROUP BY stage
  LOOP
    INSERT INTO public.pipeline_analytics (
      user_id, stage, total_deals, total_value, avg_deal_size,
      period_start, period_end
    ) VALUES (
      user_id_param, stage_record.stage, stage_record.deal_count,
      stage_record.total_value, stage_record.avg_deal_size,
      current_period_start, current_period_end
    );
  END LOOP;
END;
$$;

-- Create triggers for deals
CREATE TRIGGER update_deals_updated_at
  BEFORE UPDATE ON public.deals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger to update pipeline analytics when deals change
CREATE OR REPLACE FUNCTION public.deals_analytics_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  -- Update analytics for the user
  PERFORM public.update_pipeline_analytics(COALESCE(NEW.user_id, OLD.user_id));
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER deals_change_analytics
  AFTER INSERT OR UPDATE OR DELETE ON public.deals
  FOR EACH ROW
  EXECUTE FUNCTION public.deals_analytics_trigger();

-- Add foreign key constraints
ALTER TABLE public.deals ADD CONSTRAINT deals_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;

-- Create indexes for performance
CREATE INDEX idx_deals_user_id ON public.deals(user_id);
CREATE INDEX idx_deals_client_id ON public.deals(client_id);
CREATE INDEX idx_deals_stage ON public.deals(stage);
CREATE INDEX idx_deals_expected_close_date ON public.deals(expected_close_date);
CREATE INDEX idx_deals_deal_value ON public.deals(deal_value);
CREATE INDEX idx_sales_forecasts_user_id ON public.sales_forecasts(user_id);
CREATE INDEX idx_sales_forecasts_period ON public.sales_forecasts(period_start, period_end);
CREATE INDEX idx_pipeline_analytics_user_id ON public.pipeline_analytics(user_id);
CREATE INDEX idx_pipeline_analytics_stage ON public.pipeline_analytics(stage);
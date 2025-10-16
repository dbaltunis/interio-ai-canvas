-- Phase 9: Database Optimization
-- Add missing indexes for performance
CREATE INDEX IF NOT EXISTS idx_clients_funnel_stage ON clients(funnel_stage);
CREATE INDEX IF NOT EXISTS idx_clients_lead_source ON clients(lead_source);
CREATE INDEX IF NOT EXISTS idx_clients_assigned_to ON clients(assigned_to);
CREATE INDEX IF NOT EXISTS idx_clients_follow_up_date ON clients(follow_up_date);
CREATE INDEX IF NOT EXISTS idx_clients_lead_score ON clients(lead_score);
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_deals_stage ON deals(stage) WHERE stage IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_deals_expected_close_date ON deals(expected_close_date) WHERE expected_close_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_deals_client_id ON deals(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id) WHERE client_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_emails_client_id ON emails(client_id) WHERE client_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_appointments_client_id ON appointments(client_id) WHERE client_id IS NOT NULL;

-- Create materialized view for client stats (for performance)
CREATE MATERIALIZED VIEW IF NOT EXISTS client_stats_mv AS
SELECT 
  c.id,
  c.name,
  c.company_name,
  c.funnel_stage,
  c.lead_source,
  c.lead_score,
  c.deal_value,
  c.conversion_probability,
  c.follow_up_date,
  c.last_contact_date,
  c.assigned_to,
  c.user_id,
  COUNT(DISTINCT p.id) as project_count,
  COUNT(DISTINCT e.id) as email_count,
  COUNT(DISTINCT a.id) as appointment_count,
  COALESCE(SUM(d.deal_value), 0) as total_deal_value,
  MAX(COALESCE(p.updated_at, e.updated_at, a.updated_at)) as last_activity
FROM clients c
LEFT JOIN projects p ON p.client_id = c.id
LEFT JOIN emails e ON e.client_id = c.id
LEFT JOIN appointments a ON a.client_id = c.id
LEFT JOIN deals d ON d.client_id = c.id
GROUP BY c.id, c.name, c.company_name, c.funnel_stage, c.lead_source, c.lead_score, 
         c.deal_value, c.conversion_probability, c.follow_up_date, c.last_contact_date,
         c.assigned_to, c.user_id;

-- Create index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_client_stats_mv_id ON client_stats_mv(id);

-- Function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_client_stats()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY client_stats_mv;
END;
$$;

-- Grant necessary permissions
GRANT SELECT ON client_stats_mv TO authenticated;
GRANT EXECUTE ON FUNCTION refresh_client_stats() TO authenticated;
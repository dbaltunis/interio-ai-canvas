-- Campaign recipients table for server-side campaign execution
-- Stores per-recipient status so campaigns can resume if interrupted
CREATE TABLE IF NOT EXISTS campaign_recipients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES email_campaigns(id) ON DELETE CASCADE,
  client_id UUID,
  email TEXT NOT NULL,
  name TEXT,
  status TEXT DEFAULT 'pending',  -- pending, sent, failed, skipped
  email_id UUID,
  error_message TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campaign_recipients_campaign ON campaign_recipients(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_status ON campaign_recipients(campaign_id, status);

-- Enable RLS
ALTER TABLE campaign_recipients ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read/write their campaign recipients
CREATE POLICY "Users can manage their campaign recipients" ON campaign_recipients
  FOR ALL USING (
    campaign_id IN (
      SELECT id FROM email_campaigns WHERE user_id = auth.uid()
    )
  );

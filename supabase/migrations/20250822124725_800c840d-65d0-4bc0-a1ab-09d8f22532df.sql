
-- Create client_activity_log table
CREATE TABLE IF NOT EXISTS client_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    activity_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    value_amount NUMERIC,
    team_member TEXT,
    follow_up_date DATE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE client_activity_log ENABLE ROW LEVEL SECURITY;

-- Users can view activities for their clients
CREATE POLICY "Users can view client activities" ON client_activity_log
    FOR SELECT
    USING (
        user_id = auth.uid() OR 
        client_id IN (
            SELECT id FROM clients WHERE user_id = auth.uid()
        )
    );

-- Users can create activities for their clients
CREATE POLICY "Users can create client activities" ON client_activity_log
    FOR INSERT
    WITH CHECK (
        user_id = auth.uid() AND
        client_id IN (
            SELECT id FROM clients WHERE user_id = auth.uid()
        )
    );

-- Users can update activities for their clients
CREATE POLICY "Users can update client activities" ON client_activity_log
    FOR UPDATE
    USING (
        user_id = auth.uid() OR 
        client_id IN (
            SELECT id FROM clients WHERE user_id = auth.uid()
        )
    );

-- Users can delete activities for their clients
CREATE POLICY "Users can delete client activities" ON client_activity_log
    FOR DELETE
    USING (
        user_id = auth.uid() OR 
        client_id IN (
            SELECT id FROM clients WHERE user_id = auth.uid()
        )
    );

-- Create indexes for better performance
CREATE INDEX idx_client_activity_log_client_id ON client_activity_log(client_id);
CREATE INDEX idx_client_activity_log_user_id ON client_activity_log(user_id);
CREATE INDEX idx_client_activity_log_created_at ON client_activity_log(created_at);


-- Add index to improve performance when querying emails by client
CREATE INDEX IF NOT EXISTS idx_emails_client_id ON emails(client_id);

-- Add index for better performance on email queries with user_id and client_id
CREATE INDEX IF NOT EXISTS idx_emails_user_client ON emails(user_id, client_id);

-- Update the emails table to ensure client_id foreign key relationship is properly handled
-- (This is mainly for documentation and future reference since the column already exists)
COMMENT ON COLUMN emails.client_id IS 'Links email to a specific client for CRM tracking';

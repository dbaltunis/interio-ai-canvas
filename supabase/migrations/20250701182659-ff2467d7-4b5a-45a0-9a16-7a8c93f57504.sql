
-- Allow projects to be created without a client initially
ALTER TABLE projects ALTER COLUMN client_id DROP NOT NULL;

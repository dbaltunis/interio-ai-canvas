-- Fix the permission_audit_log action check constraint to allow proper values
DO $$ 
BEGIN
    -- Drop the existing check constraint if it exists
    IF EXISTS (SELECT 1 FROM information_schema.check_constraints 
               WHERE constraint_name = 'permission_audit_log_action_check') THEN
        ALTER TABLE permission_audit_log DROP CONSTRAINT permission_audit_log_action_check;
    END IF;
    
    -- Add the correct check constraint with all valid action values
    ALTER TABLE permission_audit_log 
    ADD CONSTRAINT permission_audit_log_action_check 
    CHECK (action IN ('granted', 'revoked', 'updated', 'role_change'));
    
END $$;
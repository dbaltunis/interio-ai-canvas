-- Force update the specific email that should be delivered
UPDATE emails 
SET status = 'delivered', updated_at = NOW()
WHERE id = 'e5ff0ad5-6449-413c-9ce9-70dcdebe7969' AND status = 'processed';

-- Let's also check if there are any RLS issues and add better indexing
-- Check current RLS policies for emails table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'emails';
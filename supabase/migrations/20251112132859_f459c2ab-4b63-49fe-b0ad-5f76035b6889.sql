-- Add account_type to user_profiles
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS account_type text DEFAULT 'production'
CHECK (account_type IN ('production', 'test', 'partner', 'reseller', 'internal'));

COMMENT ON COLUMN user_profiles.account_type IS 'Type of account: production (normal), test (testing), partner (business partner), reseller (reseller account), internal (company internal)';

-- Add subscription_type and admin_notes to user_subscriptions
ALTER TABLE user_subscriptions 
ADD COLUMN IF NOT EXISTS subscription_type text DEFAULT 'standard'
CHECK (subscription_type IN ('standard', 'partner', 'reseller', 'test', 'lifetime'));

ALTER TABLE user_subscriptions 
ADD COLUMN IF NOT EXISTS admin_notes text;

COMMENT ON COLUMN user_subscriptions.subscription_type IS 'Type of subscription: standard (normal paid), partner (partner access), reseller (reseller access), test (test account), lifetime (lifetime access)';
COMMENT ON COLUMN user_subscriptions.admin_notes IS 'Admin notes for documenting special arrangements or subscription details';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_account_type ON user_profiles(account_type);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_subscription_type ON user_subscriptions(subscription_type);

-- RLS Policies for admin access to user_profiles
DROP POLICY IF EXISTS "Admins can update account types" ON user_profiles;
CREATE POLICY "Admins can update account types"
ON user_profiles FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- RLS Policies for admin access to user_subscriptions
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON user_subscriptions;
CREATE POLICY "Admins can view all subscriptions"
ON user_subscriptions FOR SELECT
TO authenticated
USING (is_admin());

DROP POLICY IF EXISTS "Admins can update all subscriptions" ON user_subscriptions;
CREATE POLICY "Admins can update all subscriptions"
ON user_subscriptions FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can insert subscriptions" ON user_subscriptions;
CREATE POLICY "Admins can insert subscriptions"
ON user_subscriptions FOR INSERT
TO authenticated
WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can delete subscriptions" ON user_subscriptions;
CREATE POLICY "Admins can delete subscriptions"
ON user_subscriptions FOR DELETE
TO authenticated
USING (is_admin());
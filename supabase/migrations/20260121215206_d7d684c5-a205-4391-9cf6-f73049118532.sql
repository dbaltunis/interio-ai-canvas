-- =====================================================
-- ADD SYSTEM OWNER POLICIES FOR ADMIN PANEL
-- =====================================================

-- 1. Allow System Owners to manage ALL account feature flags
CREATE POLICY "System owners can manage all feature flags"
ON public.account_feature_flags
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND role = 'System Owner'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND role = 'System Owner'
  )
);

-- 2. Allow System Owners to UPDATE all subscriptions (for seat limits)
CREATE POLICY "System owners can update all subscriptions"
ON public.user_subscriptions
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND role = 'System Owner'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND role = 'System Owner'
  )
);

-- 3. Allow System Owners to VIEW all subscriptions (admin panel needs this)
CREATE POLICY "System owners can view all subscriptions"
ON public.user_subscriptions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND role = 'System Owner'
  )
);
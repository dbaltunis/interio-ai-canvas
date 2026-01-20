-- Fix 1: Update emails foreign key to CASCADE on client delete
ALTER TABLE public.emails 
DROP CONSTRAINT IF EXISTS emails_client_id_fkey;

ALTER TABLE public.emails 
ADD CONSTRAINT emails_client_id_fkey 
FOREIGN KEY (client_id) 
REFERENCES public.clients(id) 
ON DELETE CASCADE;

-- Fix 2: Fix business_settings UPDATE policy
DROP POLICY IF EXISTS "Account isolation - UPDATE" ON public.business_settings;
DROP POLICY IF EXISTS "account_update" ON public.business_settings;

CREATE POLICY "business_settings_update_policy" ON public.business_settings
FOR UPDATE
USING (
  public.get_effective_account_owner(auth.uid()) = public.get_effective_account_owner(user_id)
)
WITH CHECK (
  public.get_effective_account_owner(auth.uid()) = public.get_effective_account_owner(user_id)
);
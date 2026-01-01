-- Add SELECT policy for email_campaigns
CREATE POLICY "Users can view own campaigns" ON public.email_campaigns
FOR SELECT USING (auth.uid() = user_id);

-- Add UPDATE policy for email_campaigns
CREATE POLICY "Users can update own campaigns" ON public.email_campaigns
FOR UPDATE USING (auth.uid() = user_id);

-- Add DELETE policy for email_campaigns
CREATE POLICY "Users can delete own campaigns" ON public.email_campaigns
FOR DELETE USING (auth.uid() = user_id);
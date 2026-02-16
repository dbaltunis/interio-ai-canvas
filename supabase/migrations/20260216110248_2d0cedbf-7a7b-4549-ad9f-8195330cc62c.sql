-- Fix: Allow users to insert notifications for team members in the same account
-- This is needed for calendar invite notifications where user A creates a notification for user B

DROP POLICY IF EXISTS "Allow notification inserts" ON public.notifications;

CREATE POLICY "Allow notification inserts"
ON public.notifications
FOR INSERT
WITH CHECK (
  (CURRENT_USER = 'postgres'::name)
  OR (auth.uid() = user_id)
  OR is_same_account(user_id)
);
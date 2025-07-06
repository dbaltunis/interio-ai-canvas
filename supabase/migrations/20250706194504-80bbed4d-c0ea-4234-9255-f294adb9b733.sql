
-- Add INSERT policy for notifications table to allow users to create their own notifications
CREATE POLICY "Users can create their own notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

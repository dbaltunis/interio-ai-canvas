
-- Add foreign key relationships for user_profiles table
ALTER TABLE public.user_profiles ADD CONSTRAINT user_profiles_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add foreign key relationships for user_presence table  
ALTER TABLE public.user_presence ADD CONSTRAINT user_presence_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add foreign key relationships for user_messages table
ALTER TABLE public.user_messages ADD CONSTRAINT user_messages_sender_id_fkey 
FOREIGN KEY (sender_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.user_messages ADD CONSTRAINT user_messages_recipient_id_fkey 
FOREIGN KEY (recipient_id) REFERENCES auth.users(id) ON DELETE CASCADE;

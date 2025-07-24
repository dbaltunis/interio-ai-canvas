
-- Create user_profiles table to store display information
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  status TEXT DEFAULT 'available',
  status_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Create user_presence table to track active users and their locations
CREATE TABLE public.user_presence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  current_page TEXT,
  current_job_id UUID,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_online BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Create user_messages table for direct messaging
CREATE TABLE public.user_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create message_attachments table for file sharing
CREATE TABLE public.message_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES public.user_messages(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  file_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_attachments ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_profiles
CREATE POLICY "Users can view all profiles" ON public.user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS policies for user_presence
CREATE POLICY "Users can view all presence" ON public.user_presence FOR SELECT USING (true);
CREATE POLICY "Users can update their own presence" ON public.user_presence FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own presence" ON public.user_presence FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS policies for user_messages
CREATE POLICY "Users can view their own messages" ON public.user_messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
CREATE POLICY "Users can send messages" ON public.user_messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can update their own messages" ON public.user_messages FOR UPDATE USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- RLS policies for message_attachments
CREATE POLICY "Users can view attachments for their messages" ON public.message_attachments FOR SELECT USING (
  message_id IN (
    SELECT id FROM public.user_messages 
    WHERE sender_id = auth.uid() OR recipient_id = auth.uid()
  )
);
CREATE POLICY "Users can add attachments to their messages" ON public.message_attachments FOR INSERT WITH CHECK (
  message_id IN (
    SELECT id FROM public.user_messages 
    WHERE sender_id = auth.uid()
  )
);

-- Add triggers for updated_at timestamps
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_presence_updated_at
  BEFORE UPDATE ON public.user_presence
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_messages_updated_at
  BEFORE UPDATE ON public.user_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to automatically create user profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email));
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_profile();

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_presence;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_attachments;

-- Set replica identity for realtime updates
ALTER TABLE public.user_profiles REPLICA IDENTITY FULL;
ALTER TABLE public.user_presence REPLICA IDENTITY FULL;
ALTER TABLE public.user_messages REPLICA IDENTITY FULL;
ALTER TABLE public.message_attachments REPLICA IDENTITY FULL;

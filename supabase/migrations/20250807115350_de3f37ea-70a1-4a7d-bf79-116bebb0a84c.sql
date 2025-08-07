-- Fix storage RLS policies for secure file uploads
-- Create policies for project-documents bucket
CREATE POLICY "Authenticated users can upload files" 
ON storage.objects 
FOR INSERT 
TO authenticated
WITH CHECK (
  bucket_id = 'project-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own files" 
ON storage.objects 
FOR SELECT 
TO authenticated
USING (
  bucket_id = 'project-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own files" 
ON storage.objects 
FOR UPDATE 
TO authenticated
USING (
  bucket_id = 'project-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own files" 
ON storage.objects 
FOR DELETE 
TO authenticated
USING (
  bucket_id = 'project-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create policies for project-images bucket
CREATE POLICY "Authenticated users can upload images" 
ON storage.objects 
FOR INSERT 
TO authenticated
WITH CHECK (
  bucket_id = 'project-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own images" 
ON storage.objects 
FOR SELECT 
TO authenticated
USING (
  bucket_id = 'project-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own images" 
ON storage.objects 
FOR UPDATE 
TO authenticated
USING (
  bucket_id = 'project-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own images" 
ON storage.objects 
FOR DELETE 
TO authenticated
USING (
  bucket_id = 'project-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create policies for email-attachments bucket (private)
CREATE POLICY "Users can upload email attachments" 
ON storage.objects 
FOR INSERT 
TO authenticated
WITH CHECK (
  bucket_id = 'email-attachments' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own email attachments" 
ON storage.objects 
FOR SELECT 
TO authenticated
USING (
  bucket_id = 'email-attachments' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Fix user_profiles security - restrict to team/account context
DROP POLICY IF EXISTS "Users can view all profiles" ON public.user_profiles;

CREATE POLICY "Users can view profiles in their account context" 
ON public.user_profiles 
FOR SELECT 
TO authenticated
USING (
  user_id = auth.uid() 
  OR 
  -- Users can see profiles of users in the same account
  public.get_account_owner(user_id) = public.get_account_owner(auth.uid())
  OR
  -- Admins can see all profiles
  has_permission('manage_users'::text)
);

-- Prevent privilege escalation in user_permissions
DROP POLICY IF EXISTS "Admins can manage permissions" ON public.user_permissions;

CREATE POLICY "Admins can manage permissions with restrictions" 
ON public.user_permissions 
FOR ALL
TO authenticated
USING (
  has_permission('manage_users'::text)
  AND
  -- Prevent users from granting permissions they don't have
  (
    permission_name = ANY(
      SELECT unnest(public.get_default_permissions_for_role(
        (SELECT role FROM public.user_profiles WHERE user_id = auth.uid())
      ))
    )
    OR
    EXISTS (
      SELECT 1 FROM public.user_permissions 
      WHERE user_id = auth.uid() 
      AND user_permissions.permission_name = public.user_permissions.permission_name
    )
  )
)
WITH CHECK (
  has_permission('manage_users'::text)
  AND
  -- Same check for inserts/updates
  (
    permission_name = ANY(
      SELECT unnest(public.get_default_permissions_for_role(
        (SELECT role FROM public.user_profiles WHERE user_id = auth.uid())
      ))
    )
    OR
    EXISTS (
      SELECT 1 FROM public.user_permissions 
      WHERE user_id = auth.uid() 
      AND user_permissions.permission_name = public.user_permissions.permission_name
    )
  )
);

-- Create secure messaging table to replace local state
CREATE TABLE IF NOT EXISTS public.direct_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  file_url text,
  file_name text,
  message_type text NOT NULL DEFAULT 'text',
  read_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for direct messages
CREATE POLICY "Users can view their conversations" 
ON public.direct_messages 
FOR SELECT 
TO authenticated
USING (
  sender_id = auth.uid() 
  OR 
  recipient_id = auth.uid()
);

CREATE POLICY "Users can send messages" 
ON public.direct_messages 
FOR INSERT 
TO authenticated
WITH CHECK (
  sender_id = auth.uid()
);

CREATE POLICY "Users can update their own messages" 
ON public.direct_messages 
FOR UPDATE 
TO authenticated
USING (
  sender_id = auth.uid()
);

CREATE POLICY "Users can delete their own messages" 
ON public.direct_messages 
FOR DELETE 
TO authenticated
USING (
  sender_id = auth.uid()
);

-- Add trigger for updated_at
CREATE TRIGGER update_direct_messages_updated_at
  BEFORE UPDATE ON public.direct_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to sanitize user input
CREATE OR REPLACE FUNCTION public.sanitize_text_input(input_text text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Remove potential XSS patterns
  input_text := regexp_replace(input_text, '<[^>]*>', '', 'g');
  input_text := regexp_replace(input_text, 'javascript:', '', 'gi');
  input_text := regexp_replace(input_text, 'on\w+\s*=', '', 'gi');
  
  -- Limit length
  IF length(input_text) > 10000 THEN
    input_text := substring(input_text from 1 for 10000);
  END IF;
  
  RETURN trim(input_text);
END;
$$;
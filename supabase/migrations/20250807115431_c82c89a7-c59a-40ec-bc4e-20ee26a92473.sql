-- Drop existing storage policies to avoid conflicts
DROP POLICY IF EXISTS "Users can upload email attachments" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own email attachments" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;

-- Create secure storage policies for file uploads
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
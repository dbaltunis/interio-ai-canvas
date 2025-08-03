-- Create user invitations table
CREATE TABLE public.user_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  invited_email TEXT NOT NULL,
  invited_name TEXT,
  role TEXT NOT NULL DEFAULT 'Staff',
  permissions JSONB DEFAULT '{}',
  invitation_token UUID NOT NULL DEFAULT gen_random_uuid(),
  status TEXT NOT NULL DEFAULT 'pending',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  invited_by_name TEXT,
  invited_by_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(invited_email, user_id)
);

-- Enable RLS
ALTER TABLE public.user_invitations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can create invitations" 
ON public.user_invitations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their invitations" 
ON public.user_invitations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their invitations" 
ON public.user_invitations 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their invitations" 
ON public.user_invitations 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE TRIGGER update_user_invitations_updated_at
BEFORE UPDATE ON public.user_invitations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, Loader } from "lucide-react";

const AcceptInvitation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading');
  const [invitation, setInvitation] = useState<any>(null);
  const [message, setMessage] = useState('');

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('This invitation link is invalid. Please check the URL or request a new invitation from your team administrator.');
      return;
    }

    const checkInvitation = async () => {
      try {
        const { data: invitationData, error } = await supabase
          .rpc('get_invitation_by_token', { invitation_token_param: token })
          .maybeSingle();

        if (error) {
          console.error('[AcceptInvitation] RPC error:', error);
          setStatus('error');
          setMessage('Unable to verify invitation. This link may have already been used or is no longer valid. Please contact your team administrator for a new invitation.');
          return;
        }

        if (!invitationData) {
          setStatus('error');
          setMessage('This invitation could not be found. It may have been cancelled or already accepted. Please contact your team administrator if you need assistance.');
          return;
        }

        const expiresAt = new Date(invitationData.expires_at);
        if (expiresAt < new Date()) {
          setStatus('expired');
          setMessage('This invitation link has expired. Please request a new invitation from your team administrator.');
          return;
        }

        setInvitation(invitationData);
        setStatus('success');
        setMessage(`You've been invited by ${invitationData.invited_by_name} to join as ${invitationData.role}`);
      } catch (error) {
        console.error('Error checking invitation:', error);
        setStatus('error');
        setMessage('We encountered an error while processing your invitation. Please try again or contact support if the problem persists.');
      }
    };

    checkInvitation();
  }, [token]);

  const handleAcceptInvitation = async () => {
    setStatus('loading');
    setMessage('Processing your invitation...');
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // User is already logged in - accept directly
        const { data: result, error } = await supabase.rpc('accept_user_invitation', {
          invitation_token_param: token,
          user_id_param: user.id,
        });
        
        if (error) {
          throw new Error(error.message || 'Failed to accept invitation');
        }
        
        setStatus('success');
        setMessage('✓ Invitation accepted successfully! Taking you to your dashboard...');
        setTimeout(() => navigate('/'), 2000);
        return;
      }
    } catch (error: any) {
      console.error('[AcceptInvitation] Error:', error);
      setStatus('error');
      setMessage(error.message || 'Failed to accept invitation. Please try again or contact support.');
      return;
    }
    
    // User not logged in - redirect to auth with invitation
    navigate(`/auth?invitation=${token}`);
  };

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="flex items-center justify-center space-x-2">
            <Loader className="h-4 w-4 animate-spin" />
            <span>Verifying invitation...</span>
          </div>
        );

      case 'success':
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Valid Invitation</span>
            </div>
            
            {invitation && (
              <div className="space-y-2">
                <p><strong>Invited by:</strong> {invitation.invited_by_name}</p>
                <p><strong>Role:</strong> {invitation.role}</p>
                <p><strong>Email:</strong> {invitation.invited_email}</p>
              </div>
            )}

            <Button onClick={handleAcceptInvitation} className="w-full">
              Accept Invitation & Sign Up
            </Button>
          </div>
        );

      case 'error':
      case 'expired':
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-red-600">
              <XCircle className="h-5 w-5" />
              <span className="font-medium">
                {status === 'expired' ? 'Invitation Expired' : 'Invalid Invitation'}
              </span>
            </div>
            
            <Alert>
              <AlertDescription>{message}</AlertDescription>
            </Alert>

            <Button onClick={() => navigate('/auth')} variant="outline" className="w-full">
              Go to Login
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Team Invitation</CardTitle>
          <CardDescription>
            {status === 'loading' 
              ? 'Processing your invitation...' 
              : 'You have been invited to join the team'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
};

export default AcceptInvitation;

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
      setMessage('Invalid invitation link - no token provided');
      return;
    }

    const checkInvitation = async () => {
      try {
        // Check if invitation exists and is valid
        const { data: invitationData, error } = await supabase
          .from('user_invitations')
          .select('*')
          .eq('invitation_token', token)
          .eq('status', 'pending')
          .single();

        if (error || !invitationData) {
          setStatus('error');
          setMessage('Invitation not found or has already been used');
          return;
        }

        // Check if invitation has expired
        const expiresAt = new Date(invitationData.expires_at);
        if (expiresAt < new Date()) {
          setStatus('expired');
          setMessage('This invitation has expired');
          return;
        }

        setInvitation(invitationData);
        setStatus('success');
        setMessage(`You've been invited to join as a ${invitationData.role}`);
      } catch (error) {
        console.error('Error checking invitation:', error);
        setStatus('error');
        setMessage('An error occurred while processing your invitation');
      }
    };

    checkInvitation();
  }, [token]);

  const handleAcceptInvitation = () => {
    // Redirect to signup/login with the invitation token
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
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2, AlertCircle, Copy, Check, LogIn } from 'lucide-react';
import { toast } from 'sonner';

export default function SubscriptionSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session_id');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'existing'>('loading');
  const [email, setEmail] = useState<string>('');
  const [temporaryPassword, setTemporaryPassword] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      setErrorMessage('No session ID found. Please try the checkout process again.');
      return;
    }

    const provisionAccount = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('provision-subscription-account', {
          body: { sessionId },
        });

        if (error) {
          throw new Error(error.message);
        }

        if (data.existingUser) {
          setStatus('existing');
          setEmail(data.email);
        } else {
          setStatus('success');
          setEmail(data.email);
          setTemporaryPassword(data.temporaryPassword);
        }
      } catch (err) {
        console.error('Error provisioning account:', err);
        setStatus('error');
        setErrorMessage(err instanceof Error ? err.message : 'Failed to provision account');
      }
    };

    provisionAccount();
  }, [sessionId]);

  const copyPassword = () => {
    navigator.clipboard.writeText(temporaryPassword);
    setCopied(true);
    toast.success('Password copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary" />
            <CardTitle className="mt-4">Setting Up Your Account</CardTitle>
            <CardDescription>
              Please wait while we verify your payment and create your account...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-destructive" />
            <CardTitle className="mt-4">Something Went Wrong</CardTitle>
            <CardDescription>{errorMessage}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              If you've been charged, please contact our support team and we'll resolve this immediately.
            </p>
            <Button onClick={() => navigate('/pricing')}>
              Return to Pricing
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'existing') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
            <CardTitle className="mt-4">Payment Successful!</CardTitle>
            <CardDescription>
              Your subscription has been activated for {email}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-lg text-center">
              <p className="text-sm text-muted-foreground">
                You already have an account. Please login with your existing credentials.
              </p>
            </div>
            <Button asChild className="w-full">
              <Link to="/auth">
                <LogIn className="mr-2 h-4 w-4" />
                Go to Login
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
          <CardTitle className="mt-4">Welcome! Your Account is Ready</CardTitle>
          <CardDescription>
            Your subscription has been activated and your account has been created.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted p-4 rounded-lg space-y-3">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Email</p>
              <p className="font-medium">{email}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Temporary Password</p>
              <div className="flex items-center gap-2">
                <code className="bg-background px-3 py-1.5 rounded font-mono text-sm flex-1">
                  {temporaryPassword}
                </code>
                <Button variant="outline" size="icon" onClick={copyPassword}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 p-4 rounded-lg">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong>Important:</strong> Please save your password and change it after your first login.
              A copy has also been sent to your email.
            </p>
          </div>

          <Button asChild className="w-full" size="lg">
            <Link to="/auth">
              <LogIn className="mr-2 h-4 w-4" />
              Login to Your Account
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

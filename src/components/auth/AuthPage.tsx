
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from './AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { UserPlus, Mail, Eye, EyeOff } from 'lucide-react';

export const AuthPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [invitation, setInvitation] = useState<any>(null);
  const [loadingInvitation, setLoadingInvitation] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const invitationToken = searchParams.get('invitation');

  // Load invitation details if token is present
  useEffect(() => {
    if (invitationToken) {
      setIsSignUp(true);
      setLoadingInvitation(true);
      
      const loadInvitation = async () => {
        try {
          console.log('[AuthPage] Loading invitation via RPC:', invitationToken);
          const { data: invitationData, error } = await supabase
            .rpc('get_invitation_by_token', { invitation_token_param: invitationToken })
            .maybeSingle();

          if (error) {
            console.error('[AuthPage] RPC error:', error);
            toast({
              title: "Error",
              description: "Invalid or expired invitation",
              variant: "destructive"
            });
            navigate('/auth');
            return;
          }

          if (!invitationData) {
            console.warn('[AuthPage] No invitation returned (invalid/expired/used).');
            toast({
              title: "Error",
              description: "Invalid or expired invitation",
              variant: "destructive"
            });
            navigate('/auth');
            return;
          }

          // Check if invitation has expired (extra safety)
          const expiresAt = new Date(invitationData.expires_at);
          if (expiresAt < new Date()) {
            toast({
              title: "Error",
              description: "This invitation has expired",
              variant: "destructive"
            });
            navigate('/auth');
            return;
          }

          setInvitation(invitationData);
          setEmail(invitationData.invited_email);
        } catch (error) {
          console.error('Error loading invitation:', error);
          toast({
            title: "Error",
            description: "Failed to load invitation details",
            variant: "destructive"
          });
        } finally {
          setLoadingInvitation(false);
        }
      };

      loadInvitation();
    }
  }, [invitationToken, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp && invitation) {
        // Handle invitation signup
        if (password !== confirmPassword) {
          toast({
            title: "Error",
            description: "Passwords do not match",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }

        console.log('[AuthPage] Attempting signup for invitation user:', email);
        const { data: signUpData, error } = await signUp(email, password);

        if (error) {
          console.error('[AuthPage] Signup error:', error);
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive"
          });
        } else if (signUpData?.user) {
          console.log('[AuthPage] Signup successful, user ID:', signUpData.user.id);
          
          // Try to accept the invitation immediately after signup
          try {
            const { data: acceptResult, error: acceptError } = await supabase.rpc('accept_user_invitation', {
              invitation_token_param: invitationToken,
              user_id_param: signUpData.user.id,
            });
            
            if (acceptError) {
              console.error('[AuthPage] Immediate invitation acceptance failed:', acceptError);
              toast({
                title: "Almost there",
                description: "Please check your email to confirm your account. After confirming, your invitation will be processed automatically.",
              });
            } else {
              console.log('[AuthPage] Immediate invitation acceptance successful:', acceptResult);
              toast({
                title: "Success!",
                description: "Your account has been created and invitation accepted. Please check your email to confirm your account.",
              });
            }
          } catch (acceptErr) {
            console.error('[AuthPage] Error accepting invitation immediately:', acceptErr);
            toast({
              title: "Almost there",
              description: "Please check your email to confirm your account. After confirming, your invitation will be processed automatically.",
            });
          }
        }
        } else {
          // Handle regular login/signup
          const { error } = isSignUp 
            ? await signUp(email, password)
            : await signIn(email, password);

          if (error) {
            toast({
              title: "Error",
              description: error.message,
              variant: "destructive"
            });
          } else {
            if (isSignUp) {
              toast({
                title: "Success",
                description: "Check your email to confirm your account"
              });
            } else {
              // Successful sign-in: navigate to the app immediately
              try {
                navigate('/');
              } catch {
                window.location.href = '/';
              }
            }
          }
        }
    } catch (err) {
      console.error('[AuthPage] unexpected error:', err);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingInvitation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">Loading invitation...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <div className="grid lg:grid-cols-2 gap-12 items-center w-full max-w-6xl">
          {/* Left side - Branding and Info */}
          <div className="space-y-8 text-center lg:text-left">
            <div className="space-y-4">
              <img 
                src="/lovable-uploads/b4044156-cf14-4da2-92bf-8996d9998f72.png" 
                alt="InterioApp Logo" 
                className="h-20 w-auto mx-auto lg:mx-0"
              />
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold text-foreground">
                  InterioApp
                </h1>
                <p className="text-lg text-muted-foreground mt-2">
                  The future of window décor is online and bespoke
                </p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="text-left space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                  <div>
                    <h3 className="font-semibold text-foreground">Project Management</h3>
                    <p className="text-muted-foreground text-sm">Organize your window treatment projects with ease</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                  <div>
                    <h3 className="font-semibold text-foreground">Smart Calculations</h3>
                    <p className="text-muted-foreground text-sm">Automated fabric calculations and pricing</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                  <div>
                    <h3 className="font-semibold text-foreground">Client Portal</h3>
                    <p className="text-muted-foreground text-sm">Professional quotes and appointment scheduling</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Auth Form */}
          <div className="w-full max-w-md mx-auto">
            <Card className="shadow-lg border-0 bg-card/60 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                {invitation && (
                  <div className="mb-4">
                    <Alert className="text-left">
                      <UserPlus className="h-4 w-4" />
                      <AlertDescription>
                        <strong>{invitation.invited_by_name}</strong> invited you to join as a <strong>{invitation.role}</strong>
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
                
                <CardTitle className="text-2xl font-semibold">
                  {showResetForm
                    ? 'Reset your password'
                    : invitation
                      ? 'Complete Your Registration'
                      : (isSignUp ? 'Create Account' : 'Welcome Back')}
                </CardTitle>
                <p className="text-muted-foreground text-sm">
                  {showResetForm
                    ? 'Enter your email to receive a password reset link'
                    : invitation 
                      ? 'Set up your password to access your account'
                      : (isSignUp 
                        ? 'Start managing your window treatment business' 
                        : 'Sign in to your InterioApp account'
                      )}
                </p>
              </CardHeader>
              <CardContent>
                {showResetForm ? (
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      setResetLoading(true);
                      try {
                        const { error } = await supabase.auth.resetPasswordForEmail(email, {
                          redirectTo: `${window.location.origin}/reset-password`,
                        });
                        if (error) {
                          toast({ title: 'Error', description: error.message, variant: 'destructive' });
                        } else {
                          toast({ title: 'Email sent', description: 'Check your inbox for the reset link.' });
                          setShowResetForm(false);
                        }
                      } catch (err) {
                        console.error('[AuthPage] resetPassword error:', err);
                        toast({ title: 'Error', description: 'Could not send reset email.', variant: 'destructive' });
                      } finally {
                        setResetLoading(false);
                      }
                    }}
                    className="space-y-4"
                  >
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={resetLoading}>
                      {resetLoading ? 'Sending...' : 'Send reset link'}
                    </Button>
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => setShowResetForm(false)}
                        className="text-primary hover:underline"
                      >
                        Back to sign in
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder="Email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={!!invitation}
                          className="pl-10"
                          required
                        />
                      </div>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
                          onClick={() => setShowPassword((v) => !v)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <div className="text-right -mt-2">
                        {!invitation && (
                          <button
                            type="button"
                            onClick={() => setShowResetForm(true)}
                            className="text-sm text-primary hover:underline"
                          >
                            Forgot password?
                          </button>
                        )}
                      </div>
                      {(isSignUp && invitation) && (
                        <>
                          <div className="relative">
                            <Input
                              type={showConfirm ? 'text' : 'password'}
                              placeholder="Confirm Password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              required
                            />
                            <button
                              type="button"
                              aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
                              onClick={() => setShowConfirm((v) => !v)}
                            >
                              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                          {confirmPassword.length > 0 && (
                            <p className={`text-xs mt-1 ${password === confirmPassword ? 'text-muted-foreground' : 'text-destructive'}`}>
                              {password === confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                            </p>
                          )}
                        </>
                      )}
                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Loading...' : (
                          invitation ? 'Complete Registration' : (isSignUp ? 'Sign Up' : 'Sign In')
                        )}
                      </Button>
                    </form>
                    {!invitation && (
                      <div className="mt-4 text-center">
                        <button
                          type="button"
                          onClick={() => setIsSignUp(!isSignUp)}
                          className="text-primary hover:underline"
                        >
                          {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

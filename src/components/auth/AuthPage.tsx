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
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | null>(null);
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

  // Validate password strength
  const validatePasswordStrength = (pwd: string): 'weak' | 'medium' | 'strong' => {
    const hasMinLength = pwd.length >= 8;
    const hasUpperCase = /[A-Z]/.test(pwd);
    const hasLowerCase = /[a-z]/.test(pwd);
    const hasNumber = /\d/.test(pwd);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
    
    const criteriaCount = [hasMinLength, hasUpperCase, hasLowerCase, hasNumber, hasSpecial].filter(Boolean).length;
    
    if (criteriaCount <= 2) return 'weak';
    if (criteriaCount <= 4) return 'medium';
    return 'strong';
  };

  // Update password strength on password change
  useEffect(() => {
    if (password && isSignUp) {
      setPasswordStrength(validatePasswordStrength(password));
    } else {
      setPasswordStrength(null);
    }
  }, [password, isSignUp]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp && invitation) {
        // Handle invitation signup
        if (password !== confirmPassword) {
          toast({
            title: "Password mismatch",
            description: "Please make sure your passwords match",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        // Validate password strength
        if (passwordStrength === 'weak') {
          toast({
            title: "Weak password",
            description: "Please use a stronger password with at least 8 characters, including uppercase, lowercase, numbers, and special characters",
            variant: "destructive",
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
              accepting_user_id_param: signUpData.user.id,
            });
            
            console.log('[AuthPage] Invitation acceptance result:', acceptResult, acceptError);
            
            if (acceptError) {
              console.error('[AuthPage] Error accepting invitation:', acceptError);
              toast({
                title: "Invitation Error",
                description: "Could not accept invitation. Please contact support.",
                variant: "destructive",
              });
            } else {
              toast({
                title: "Welcome!",
                description: "Your account has been created successfully. Redirecting...",
              });
              
              // Auto-redirect after successful registration
              setTimeout(() => {
                navigate('/');
              }, 1500);
            }
          } catch (error) {
            console.error('[AuthPage] Exception accepting invitation:', error);
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

  // Password reset handler
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset`,
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: "Check your email for a password reset link"
        });
        setShowResetForm(false);
      }
    } catch (err) {
      console.error('Password reset error:', err);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setResetLoading(false);
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
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-screen">
        <div className="w-full max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex flex-col justify-center space-y-6 px-8">
              <div className="space-y-4">
                <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  InterioApp
                </h1>
                <p className="text-xl text-muted-foreground">
                  The future of window décor is online and bespoke
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="mt-1 p-2 rounded-full bg-primary/10">
                    <UserPlus className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Team Collaboration</h3>
                    <p className="text-sm text-muted-foreground">
                      Work seamlessly with your team on projects
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="mt-1 p-2 rounded-full bg-secondary/10">
                    <Mail className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Client Management</h3>
                    <p className="text-sm text-muted-foreground">
                      Manage clients, projects, and quotations in one place
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Auth Form */}
            <Card className="w-full shadow-xl">
              <div className="bg-gradient-to-r from-primary via-secondary to-accent p-0.5 rounded-t-xl">
                <div className="bg-background rounded-t-xl">
                  <CardHeader className="space-y-1 pb-4">
                    <CardTitle className="text-2xl font-bold text-center">
                      {invitation 
                        ? 'Complete Your Registration'
                        : (isSignUp ? 'Create Account' : 'Welcome Back')}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground text-center">
                      {invitation 
                        ? 'Set up your password to access your account'
                        : (isSignUp 
                          ? 'Start managing your window treatment business' 
                          : 'Sign in to your account')}
                    </p>
                  </CardHeader>
                </div>
              </div>
              
              <CardContent className="pt-6">
                {invitation && (
                  <Alert className="mb-4 border-accent/50 bg-accent/5">
                    <UserPlus className="h-4 w-4" />
                    <AlertDescription>
                      You've been invited to join {invitation.invited_by_name}'s team as a{' '}
                      <strong>{invitation.role}</strong>
                    </AlertDescription>
                  </Alert>
                )}

                {showResetForm ? (
                  <form onSubmit={handlePasswordReset} className="space-y-4">
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
                      {resetLoading ? 'Sending...' : 'Send Reset Link'}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full"
                      onClick={() => setShowResetForm(false)}
                    >
                      Back to Sign In
                    </Button>
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
                      
                      {/* Password Strength Indicator */}
                      {password && passwordStrength && isSignUp && (
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Password strength:</span>
                            <span className={`font-medium ${
                              passwordStrength === 'weak' ? 'text-destructive' :
                              passwordStrength === 'medium' ? 'text-yellow-600' :
                              'text-green-600'
                            }`}>
                              {passwordStrength === 'weak' ? '⚠️ Weak' :
                               passwordStrength === 'medium' ? '✓ Medium' :
                               '✓✓ Strong'}
                            </span>
                          </div>
                          <div className="flex gap-1">
                            <div className={`h-1.5 flex-1 rounded-full ${
                              passwordStrength === 'weak' ? 'bg-destructive' :
                              passwordStrength === 'medium' ? 'bg-yellow-600' :
                              'bg-green-600'
                            }`} />
                            <div className={`h-1.5 flex-1 rounded-full ${
                              passwordStrength === 'medium' ? 'bg-yellow-600' :
                              passwordStrength === 'strong' ? 'bg-green-600' :
                              'bg-muted'
                            }`} />
                            <div className={`h-1.5 flex-1 rounded-full ${
                              passwordStrength === 'strong' ? 'bg-green-600' : 'bg-muted'
                            }`} />
                          </div>
                          {passwordStrength === 'weak' && (
                            <p className="text-xs text-destructive">
                              Use 8+ characters with uppercase, lowercase, numbers & symbols
                            </p>
                          )}
                        </div>
                      )}

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

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
import { AIBackground } from '@/components/common/AIBackground';

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
        console.log('[AuthPage] Processing invitation-based authentication');
        
        // CRITICAL FIX: Check if user already exists (they might be clicking the email link twice)
        // First attempt to sign in to see if the account already exists
        console.log('[AuthPage] Attempting sign in to check if user exists:', email);
        const { error: signInError } = await signIn(email, password);
        
        if (!signInError) {
          // User already exists and signed in successfully, get their ID and accept invitation
          const { data: { user } } = await supabase.auth.getUser();
          
          if (user) {
            console.log('[AuthPage] User already exists, accepting invitation for user:', user.id);
            
            const { data: acceptResult, error: acceptError } = await supabase.rpc('accept_user_invitation', {
              invitation_token_param: invitationToken,
              user_id_param: user.id,
            });
            
            console.log('[AuthPage] Invitation acceptance result:', acceptResult, acceptError);
            
            if (acceptError) {
              console.error('[AuthPage] Error accepting invitation:', acceptError);
              toast({
                title: "Error accepting invitation",
                description: acceptError.message,
                variant: "destructive",
              });
            } else {
              toast({
                title: "Welcome!",
                description: "Successfully joined the team",
              });
              setTimeout(() => navigate('/'), 1500);
            }
            setLoading(false);
            return;
          }
        }
        
        // Sign in failed, user needs to create account
        console.log('[AuthPage] User does not exist, creating new account');
        
        // Validate passwords match
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

        console.log('[AuthPage] Attempting signup for new invitation user:', email);
        
        // Get inviter's user_id AND role from invitation
        const { data: invitationDetails } = await supabase
          .from('user_invitations')
          .select('user_id, role')
          .eq('invitation_token', invitationToken)
          .single();
        
        console.log('[AuthPage] Creating user with role from invitation:', invitationDetails?.role);
        
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              invitation_user_id: invitationDetails?.user_id, // Pass inviter's ID for parent_account_id
              invitation_role: invitationDetails?.role, // Pass role from invitation
              display_name: invitation.invited_name || email
            }
          }
        });

        if (signUpError) {
          console.error('[AuthPage] Signup error:', signUpError);
          toast({
            title: "Error",
            description: signUpError.message,
            variant: "destructive"
          });
        } else if (signUpData?.user) {
          console.log('[AuthPage] Signup successful, user ID:', signUpData.user.id);
          
          // Accept the invitation immediately after signup
          try {
            const { data: acceptResult, error: acceptError } = await supabase.rpc('accept_user_invitation', {
              invitation_token_param: invitationToken,
              user_id_param: signUpData.user.id,
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
              
              setTimeout(() => navigate('/'), 1500);
            }
          } catch (error) {
            console.error('[AuthPage] Exception accepting invitation:', error);
          }
        }
      } else {
        // Handle regular login/signup
        if (isSignUp) {
          // Regular signup
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

          const { error } = await signUp(email, password);
          
          if (error) {
            toast({
              title: "Error",
              description: error.message,
              variant: "destructive"
            });
          } else {
            toast({
              title: "Success!",
              description: "Your account has been created. Redirecting...",
            });
            
            // Auto-redirect after successful registration
            setTimeout(() => {
              navigate('/');
            }, 1500);
          }
        } else {
          // Regular login
          const { error } = await signIn(email, password);
          
          if (error) {
            toast({
              title: "Error",
              description: error.message,
              variant: "destructive"
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
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Animated gradient mesh background for mobile/tablet */}
      <div className="lg:hidden absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(var(--primary-rgb),0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(var(--secondary-rgb),0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_80%,rgba(var(--accent-rgb),0.08),transparent_50%)]" />
      </div>

      {/* Left Side - AI Background & Branding (Desktop Only) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10">
        {/* Animated mesh gradient background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(var(--primary-rgb),0.15),transparent_50%)] animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(var(--secondary-rgb),0.15),transparent_50%)] animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }} />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--accent-rgb),0.1),transparent_70%)] animate-pulse" style={{ animationDuration: '10s', animationDelay: '4s' }} />
        </div>
        
        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/3 right-1/4 w-40 h-40 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s', animationDuration: '8s' }} />
        <div className="absolute top-1/2 right-1/3 w-24 h-24 bg-accent/20 rounded-full blur-2xl animate-float" style={{ animationDelay: '1.5s', animationDuration: '6s' }} />
        
        <div className="relative h-full flex flex-col justify-center px-12 xl:px-16 z-10">
          {/* Logo - Much Larger */}
          <div className="mb-10">
            <img 
              src="/lovable-uploads/b4044156-cf14-4da2-92bf-8996d9998f72.png" 
              alt="InterioApp Logo" 
              className="h-20 w-auto object-contain brightness-110 drop-shadow-2xl transition-transform duration-500 hover:scale-105"
            />
          </div>

          {/* Main Heading with Enhanced Gradient Effect */}
          <div className="space-y-4 mb-12">
            <h1 className="text-6xl xl:text-7xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent drop-shadow-[0_4px_12px_rgba(0,0,0,0.2)]">
                InterioApp
              </span>
            </h1>
            <p className="text-xl xl:text-2xl text-foreground/80 font-light leading-relaxed">
              The future of window décor is online and bespoke
            </p>
          </div>

          {/* Features with glassmorphism */}
          <div className="space-y-6 mb-12">
            <div className="flex items-start space-x-4 group">
              <div className="mt-1 p-3 rounded-xl bg-primary/10 backdrop-blur-md border border-primary/20 shadow-lg group-hover:bg-primary/20 transition-all duration-300">
                <UserPlus className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Team Collaboration</h3>
                <p className="text-sm text-foreground/70">
                  Work seamlessly with your team on projects
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4 group">
              <div className="mt-1 p-3 rounded-xl bg-secondary/10 backdrop-blur-md border border-secondary/20 shadow-lg group-hover:bg-secondary/20 transition-all duration-300">
                <Mail className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Client Management</h3>
                <p className="text-sm text-foreground/70">
                  Manage clients, projects, and quotations in one place
                </p>
              </div>
            </div>
          </div>

          {/* Global Presence with better styling */}
          <div className="pt-8 border-t border-foreground/10">
            <p className="text-sm text-foreground/60 mb-4 font-medium">
              Trusted by professionals worldwide
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1.5 rounded-full bg-background/20 backdrop-blur-md border border-foreground/10 text-xs font-medium hover:bg-background/30 transition-colors">🇳🇿 NZ</span>
              <span className="px-3 py-1.5 rounded-full bg-background/20 backdrop-blur-md border border-foreground/10 text-xs font-medium hover:bg-background/30 transition-colors">🇦🇺 AU</span>
              <span className="px-3 py-1.5 rounded-full bg-background/20 backdrop-blur-md border border-foreground/10 text-xs font-medium hover:bg-background/30 transition-colors">🇫🇷 FR</span>
              <span className="px-3 py-1.5 rounded-full bg-background/20 backdrop-blur-md border border-foreground/10 text-xs font-medium hover:bg-background/30 transition-colors">🇧🇪 BE</span>
              <span className="px-3 py-1.5 rounded-full bg-background/20 backdrop-blur-md border border-foreground/10 text-xs font-medium hover:bg-background/30 transition-colors">🇬🇧 UK</span>
              <span className="px-3 py-1.5 rounded-full bg-background/20 backdrop-blur-md border border-foreground/10 text-xs font-medium hover:bg-background/30 transition-colors">🇿🇦 SA</span>
              <span className="px-3 py-1.5 rounded-full bg-background/20 backdrop-blur-md border border-foreground/10 text-xs font-medium hover:bg-background/30 transition-colors">🇪🇺 EU</span>
            </div>
            <p className="text-xs text-foreground/40">
              Offices in New Zealand, United Kingdom, France & South Africa
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-md">
          {/* Mobile/Tablet Logo - Larger */}
          <div className="lg:hidden mb-10 text-center">
            <img 
              src="/lovable-uploads/b4044156-cf14-4da2-92bf-8996d9998f72.png" 
              alt="InterioApp Logo" 
              className="h-16 w-auto object-contain mx-auto mb-6 drop-shadow-xl transition-transform duration-500 hover:scale-105"
            />
            <h1 className="text-4xl font-bold mb-2">
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent drop-shadow-lg">
                InterioApp
              </span>
            </h1>
            <p className="text-sm text-muted-foreground">
              The future of window décor is online and bespoke
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">
              {invitation 
                ? 'Complete Your Registration'
                : (isSignUp ? 'Create Account' : 'Welcome Back')}
            </h2>
            <p className="text-muted-foreground">
              {invitation 
                ? 'Set up your password to access your account'
                : (isSignUp 
                  ? 'Start managing your window treatment business' 
                  : 'Sign in to continue to InterioApp')}
            </p>
          </div>
          
          <div>
            {invitation && (
              <Alert className="mb-6 border-accent/50 bg-accent/5">
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
                      
                      {/* Password Strength Indicator - show for ALL signups */}
                      {isSignUp && password && passwordStrength && (
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

                      {isSignUp && (
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
                  </div>
                </div>
              </div>
            </div>
          );
        };

        export default AuthPage;

import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from './AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Eye, EyeOff, Mail } from 'lucide-react';
import { TypingAnimation } from './TypingAnimation';
import { ThemePreview } from './ThemePreview';
import { AnimatedGradient } from './AnimatedGradient';
import { LampToggle } from './LampToggle';

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
  const [previewTheme, setPreviewTheme] = useState<'light' | 'dark'>('dark');
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const invitationToken = searchParams.get('invitation');
  
  const typingPhrases = [
    "Design beautiful curtains and blinds...",
    "Manage projects seamlessly...",
    "Create professional quotations...",
    "Collaborate with your team...",
    "Track jobs effortlessly...",
  ];

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
    <div className="min-h-screen flex overflow-hidden">
      {/* Left side - Animated theme preview */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <AnimatedGradient previewTheme={previewTheme} />
        
        <div className="relative z-10 w-full flex flex-col justify-between p-8 lg:p-12">
          {/* Header */}
          <div className="flex items-center justify-start mb-8">
            <div className="flex items-center gap-3">
              <img 
                src="/lovable-uploads/b4044156-cf14-4da2-92bf-8996d9998f72.png" 
                alt="InterioApp Logo" 
                className={`h-12 md:h-14 w-auto transition-all duration-300 ${
                  previewTheme === 'dark' ? 'brightness-0 invert' : ''
                }`}
              />
              <span className={`text-2xl md:text-3xl font-bold ${previewTheme === 'dark' ? 'text-white' : 'text-primary'}`}>
                InterioApp
              </span>
            </div>
          </div>

          {/* Typing animation */}
          <div className="flex-1 flex flex-col justify-center space-y-8 py-8">
            <TypingAnimation phrases={typingPhrases} previewTheme={previewTheme} />
            <ThemePreview previewTheme={previewTheme} />
          </div>

          {/* Footer with theme info */}
          <div className="space-y-4">
            <div className={`text-sm text-center ${previewTheme === 'dark' ? 'text-white/60' : 'text-muted-foreground'}`}>
              <p>Experience InterioApp in {previewTheme === 'dark' ? 'dark' : 'light'} mode</p>
              <p className="mt-1">Toggle to see both themes in action ✨</p>
            </div>
            
            {/* Lamp Toggle */}
            <div className="flex justify-center">
              <LampToggle 
                previewTheme={previewTheme}
                onToggle={() => setPreviewTheme(prev => prev === 'dark' ? 'light' : 'dark')}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Auth form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-500">
        {/* Background - matches desktop left side for tablet/mobile, plain for desktop */}
        <div className={`absolute inset-0 transition-all duration-500 lg:bg-background ${
          previewTheme === 'dark' 
            ? 'bg-gradient-to-br from-[#0A2F35] via-[#1A4A52] to-[#2A5A62]' 
            : 'bg-gradient-to-br from-[#E8F4F1] via-[#F5F9F7] to-[#FFFFFF]'
        }`} />
        
        {/* Mobile/Tablet Logo */}
        <div className="lg:hidden absolute top-8 left-8 z-10 transition-all duration-500">
          <img 
            src="/lovable-uploads/b4044156-cf14-4da2-92bf-8996d9998f72.png" 
            alt="InterioApp Logo" 
            className="h-10 md:h-16 w-auto object-contain transition-all duration-500"
            style={{
              filter: previewTheme === 'dark' ? 'brightness(0) invert(1)' : 'none'
            }}
          />
        </div>

        <div className="w-full max-w-md relative z-10 animate-fade-in">
          {showResetForm ? (
            <Card className="border-border shadow-sm">
              <CardHeader className="space-y-2">
                <CardTitle className="text-2xl font-semibold text-foreground">
                  Reset Password
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Enter your email to receive a reset link
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordReset} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-10 bg-background border-input"
                        placeholder="name@company.com"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-3 pt-2">
                    <Button
                      type="submit"
                      className="w-full h-10 bg-foreground text-background hover:bg-foreground/90 font-medium"
                      disabled={resetLoading}
                    >
                      {resetLoading ? 'Sending...' : 'Send Reset Link'}
                    </Button>
                    
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full text-muted-foreground hover:text-foreground"
                      onClick={() => setShowResetForm(false)}
                    >
                      Back to Sign In
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border shadow-sm">
              <CardHeader className="space-y-2 pb-6">
                {invitation ? (
                  <>
                    <CardTitle className="text-2xl font-semibold text-foreground">
                      Join Team
                    </CardTitle>
                    <Alert className="text-left bg-primary/5 border-primary/20">
                      <AlertDescription className="text-sm">
                        You've been invited to join <strong>{invitation.company_name}</strong> as a <strong>{invitation.role}</strong>
                      </AlertDescription>
                    </Alert>
                  </>
                ) : (
                  <>
                    <CardTitle className="text-2xl font-semibold text-foreground">
                      {isSignUp ? 'Create Account' : 'Welcome Back'}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {isSignUp ? 'Get started with InterioApp' : 'Sign in to continue to InterioApp'}
                    </p>
                  </>
                )}
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Email</label>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-10 bg-background border-input"
                        placeholder="name@company.com"
                        required
                        disabled={!!invitation}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Password</label>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pr-10 h-10 bg-background border-input"
                          placeholder="••••••••"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {isSignUp && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Confirm Password</label>
                        <div className="relative">
                          <Input
                            type={showConfirm ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="pr-10 h-10 bg-background border-input"
                            placeholder="••••••••"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirm(!showConfirm)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        
                        {passwordStrength && (
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <div className="h-1 flex-1 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className={`h-full transition-all duration-300 ${
                                    passwordStrength === 'weak' ? 'w-1/3 bg-destructive' :
                                    passwordStrength === 'medium' ? 'w-2/3 bg-company-warning' :
                                    'w-full bg-company-tertiary'
                                  }`}
                                />
                              </div>
                              <span className={`text-xs font-medium capitalize ${
                                passwordStrength === 'weak' ? 'text-destructive' :
                                passwordStrength === 'medium' ? 'text-company-warning' :
                                'text-company-tertiary'
                              }`}>
                                {passwordStrength}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Use 8+ characters with uppercase, lowercase, numbers, and symbols
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 pt-2">
                    {!isSignUp && (
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => setShowResetForm(true)}
                          className="text-sm text-foreground hover:text-foreground/80 font-medium"
                        >
                          Forgot password?
                        </button>
                      </div>
                    )}
                    
                    <Button
                      type="submit"
                      className="w-full h-10 bg-foreground text-background hover:bg-foreground/90 font-medium"
                      disabled={loading}
                    >
                      {loading ? (
                        'Please wait...'
                      ) : invitation ? (
                        'Accept Invitation & Join'
                      ) : isSignUp ? (
                        'Create Account'
                      ) : (
                        'Sign In'
                      )}
                    </Button>

                    <div className="text-center text-sm text-muted-foreground">
                      {isSignUp ? (
                        <>
                          Already have an account?{' '}
                          <button
                            type="button"
                            onClick={() => {
                              if (!invitation) {
                                setIsSignUp(false);
                                setPassword('');
                                setConfirmPassword('');
                              }
                            }}
                            disabled={!!invitation}
                            className={`font-medium text-foreground hover:underline ${invitation ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            Sign in
                          </button>
                        </>
                      ) : (
                        <>
                          Don't have an account?{' '}
                          <button
                            type="button"
                            onClick={() => {
                              setIsSignUp(true);
                              setPassword('');
                              setConfirmPassword('');
                            }}
                            className="font-medium text-foreground hover:underline"
                          >
                            Sign up
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
          
          {/* Tablet/Mobile Theme Toggle */}
          <div className="lg:hidden mt-8 flex flex-col items-center gap-3">
            <p className="text-sm text-muted-foreground">
              Experience InterioApp in light and dark mode
            </p>
            <LampToggle 
              previewTheme={previewTheme}
              onToggle={() => setPreviewTheme(prev => prev === 'dark' ? 'light' : 'dark')}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;

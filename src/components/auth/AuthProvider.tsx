
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { linkUserToAccount } from '@/hooks/useAccountLinking';
import { useQueryClient } from '@tanstack/react-query';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ data?: any; error: any }>;
  signOut: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { setTheme } = useTheme();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        if (event === 'SIGNED_IN') {
          // Only navigate to home on initial sign-in, not on session refresh
          const currentPath = window.location.pathname;
          const isAuthPage = currentPath === '/auth' || currentPath === '/reset-password';
          
          try {
            // Load theme from user profile or use saved theme
            if (session?.user?.id) {
              (async () => {
                try {
                  const { data: profile } = await supabase
                    .from('user_profiles')
                    .select('theme_preference')
                    .eq('user_id', session.user.id)
                    .single();
                  
                  if (profile?.theme_preference) {
                    setTheme(profile.theme_preference);
                  } else if (!localStorage.getItem('theme')) {
                    setTheme('light');
                  }
                } catch (e) {
                  console.warn('Failed to load theme preference:', e);
                  if (!localStorage.getItem('theme')) {
                    setTheme('light');
                  }
                }
              })();
            } else if (!localStorage.getItem('theme')) {
              setTheme('light');
            }
          } catch {}
          setTimeout(() => {
            try {
              if (session?.user?.id) {
                const userId = session.user.id;
                // 1) Only link if parent_account_id is missing
                (async () => {
                  try {
                    const { data: profile } = await supabase
                      .from('user_profiles')
                      .select('parent_account_id')
                      .eq('user_id', userId)
                      .maybeSingle();

                    if (!profile || !profile.parent_account_id) {
                      await linkUserToAccount(userId).catch(() => {});
                    }
                  } catch (e) {
                    console.warn('[AuthProvider] profile check failed:', e);
                  }
                })();

                // 2) Auto-accept any pending invitation for this email (seeds role-based permissions)
                const email = session.user.email;
                if (email) {
                  (async () => {
                    try {
                      console.log('[AuthProvider] Checking for pending invitations for:', email);
                      const { data: invites, error: invErr } = await supabase
                        .from('user_invitations')
                        .select('invitation_token, invited_email, status, expires_at, role')
                        .eq('invited_email', email)
                        .eq('status', 'pending')
                        .gt('expires_at', new Date().toISOString())
                        .limit(1);

                      if (invErr) {
                        console.warn('[AuthProvider] Error checking invitations:', invErr);
                        return;
                      }

                      if (invites && invites.length > 0) {
                        const token = invites[0].invitation_token;
                        console.log('[AuthProvider] Found pending invitation, accepting token:', token);
                        if (token) {
                          const { data: acceptResult, error: acceptError } = await supabase.rpc('accept_user_invitation', {
                            invitation_token_param: token,
                            accepting_user_id_param: userId,
                          });
                          if (acceptError) {
                            console.error('[AuthProvider] Auto-accept invitation failed:', acceptError);
                          } else {
                            console.log('[AuthProvider] Auto-accepted invitation:', acceptResult);
                            // Force refresh permission queries after successful acceptance
                            setTimeout(() => {
                              queryClient.invalidateQueries({ queryKey: ['user-permissions'] });
                              queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
                              queryClient.invalidateQueries({ queryKey: ['team-presence'] });
                            }, 100);
                          }
                        }
                      } else {
                        console.log('[AuthProvider] No pending invitations found for:', email);
                      }
                    } catch (e) {
                      console.error('[AuthProvider] Invitation auto-accept error:', e);
                    }
                  })();
                }
              }
              // Refresh permission-dependent UI
              try {
                queryClient.invalidateQueries({ queryKey: ['user-permissions'] });
                queryClient.invalidateQueries({ queryKey: ['team-presence'] });
              } catch {}
              
              // Only navigate to home if user is on auth/login pages, not on session refresh
              if (isAuthPage) {
                navigate('/');
              }
            } catch {
              // Only redirect to home from auth pages
              if (isAuthPage) {
                window.location.href = '/';
              }
            }
          }, 0);
        }

        if (event === 'PASSWORD_RECOVERY') {
          // Defer navigation to avoid potential deadlocks
          setTimeout(() => {
            try {
              navigate('/reset-password');
            } catch (e) {
              // Fallback to hard redirect if navigation hook isn't ready
              window.location.href = '/reset-password';
            }
          }, 0);
        }
      }
    );

    // Get initial session with timeout
    const initAuth = async () => {
      try {
        const result = await Promise.race([
          supabase.auth.getSession(),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Auth timeout')), 5000))
        ]);
        
        if (result?.data?.session) {
          setSession(result.data.session);
          setUser(result.data.session.user);
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    // Use current origin for email redirects to work across environments
    const redirectUrl = `${window.location.origin}/`;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

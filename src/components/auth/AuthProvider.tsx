import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { linkUserToAccount } from '@/hooks/useAccountLinking';
import { useQueryClient } from '@tanstack/react-query';
import { setSentryUser, setSentryContext } from '@/lib/sentry';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ data?: any; error: any }>;
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

  // Apply cached accent theme immediately for fast visual feedback
  useEffect(() => {
    const cachedAccent = localStorage.getItem('accent-theme');
    const validThemes = ['brand', 'winter', 'spring', 'summer', 'autumn'];
    if (cachedAccent && validThemes.includes(cachedAccent)) {
      document.documentElement.setAttribute('data-accent', cachedAccent);
    } else {
      document.documentElement.setAttribute('data-accent', 'brand');
    }
  }, []);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // ✅ v2.3.7: Clear ALL cache on logout to prevent cross-account data leakage
        if (event === 'SIGNED_OUT') {
          console.log('🔒 [v2.3.7] User signed out - clearing ALL cached data');
          queryClient.clear(); // Nuclear option: remove ALL cached queries
          sessionStorage.clear(); // Clear tab state
          
          // Clear Sentry user context on logout
          setSentryUser(null);
          return;
        }

        if (event === 'SIGNED_IN') {
          // ✅ v2.3.8: Add delay before invalidating to allow database triggers to create user_profiles
          console.log('🔑 [v2.3.8] User signed in - waiting for profile creation before invalidating queries');
          setTimeout(() => {
            queryClient.invalidateQueries();
          }, 500);
          
          // Set Sentry user context for error tracking
          if (session?.user) {
            setSentryUser({
              id: session.user.id,
              email: session.user.email,
            });
          }
          
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
                      .select('theme_preference, accent_theme')
                      .eq('user_id', session.user.id)
                      .single();
                  
                    // Apply dark/light theme
                    if (profile?.theme_preference) {
                      setTheme(profile.theme_preference);
                    } else if (!localStorage.getItem('theme')) {
                      setTheme('light');
                    }
                    
                    // Apply accent color theme
                    if (profile?.accent_theme) {
                      document.documentElement.setAttribute('data-accent', profile.accent_theme);
                      localStorage.setItem('accent-theme', profile.accent_theme);
                    } else {
                      document.documentElement.setAttribute('data-accent', 'brand');
                    }
                  } catch (e) {
                    console.warn('Failed to load theme preferences:', e);
                    if (!localStorage.getItem('theme')) {
                      setTheme('light');
                    }
                    document.documentElement.setAttribute('data-accent', 'brand');
                  }
                })();
              } else if (!localStorage.getItem('theme')) {
                setTheme('light');
              }
            } catch {}
          // Defer non-critical operations to avoid blocking initial render
          setTimeout(() => {
            try {
              if (session?.user?.id) {
                const userId = session.user.id;
                // 1) Only link if parent_account_id is missing - run in background
                setTimeout(() => {
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
                }, 500); // Defer by 500ms

                // 2) Auto-accept any pending invitation for this email - run in background
                const email = session.user.email;
                if (email) {
                  setTimeout(() => {
                    (async () => {
                      try {
                        const { data: invites, error: invErr } = await supabase
                          .from('user_invitations')
                          .select('invitation_token, invited_email, status, expires_at, role')
                          .eq('invited_email', email)
                          .eq('status', 'pending')
                          .gt('expires_at', new Date().toISOString())
                          .limit(1);

                        if (invErr) return;

                        if (invites && invites.length > 0) {
                          const token = invites[0].invitation_token;
                          if (token) {
                            const { error: acceptError } = await supabase.rpc('accept_user_invitation', {
                              invitation_token_param: token,
                              user_id_param: userId,
                            });
                            if (!acceptError) {
                              // Refresh permission queries after successful acceptance
                              setTimeout(() => {
                                queryClient.invalidateQueries({ queryKey: ['user-permissions'] });
                                queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
                                queryClient.invalidateQueries({ queryKey: ['team-presence'] });
                              }, 100);
                            }
                          }
                        }
                      } catch (e) {
                        console.warn('[AuthProvider] Invitation auto-accept error:', e);
                      }
                    })();
                  }, 1000); // Defer by 1s
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

    // Get initial session with reduced timeout for faster loading
    const initAuth = async () => {
      try {
        const result = await Promise.race([
          supabase.auth.getSession(),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Auth timeout')), 8000))
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
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
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

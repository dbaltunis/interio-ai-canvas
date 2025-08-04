
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

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

  useEffect(() => {
    console.log("AuthProvider: Setting up auth listener");
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email || 'no user');
        console.log('Auth state change time:', new Date().toISOString());
        console.log('Session details:', session ? 'Session exists' : 'No session');
        console.log('Access token exists:', session?.access_token ? 'Yes' : 'No');
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        console.log('AuthProvider: Loading set to false after auth change');
        
        // Test database connectivity when session changes
        if (session?.user) {
          try {
            const { data, error } = await supabase
              .from('user_profiles')
              .select('user_id, display_name')
              .eq('user_id', session.user.id)
              .single();
            console.log('Profile query result:', { data, error });
          } catch (err) {
            console.error('Profile query failed:', err);
          }
        }
      }
    );

    // Get initial session
    console.log("AuthProvider: Getting initial session");
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('AuthProvider: Error getting session:', error);
      }
      console.log('Initial session:', session?.user?.email || 'no user', 'Error:', error);
      console.log('Initial session time:', new Date().toISOString());
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      console.log('AuthProvider: Loading set to false after initial session');
    });

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
    // Use the custom domain for email redirects
    const redirectUrl = 'https://appinterio.app/';
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

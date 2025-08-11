import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const EmailRealtimeContext = createContext({});

export const useEmailRealtime = () => {
  return useContext(EmailRealtimeContext);
};

export const EmailRealtimeProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Track auth state to avoid subscribing when logged out
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session?.user);
    });

    // Initialize from current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session?.user);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    // If not authenticated, ensure channel is removed
    if (!isAuthenticated) {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      return;
    }

    // Prevent duplicate subscriptions
    if (channelRef.current) return;

    const channel = supabase
      .channel('emails_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'emails'
        },
        () => {
          // Invalidate and refetch emails when any email changes
          queryClient.invalidateQueries({ queryKey: ['emails'] });
          queryClient.invalidateQueries({ queryKey: ['email-kpis'] });
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [queryClient, isAuthenticated]);

  return (
    <EmailRealtimeContext.Provider value={{}}>
      {children}
    </EmailRealtimeContext.Provider>
  );
};
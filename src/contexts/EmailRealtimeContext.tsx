import React, { createContext, useContext, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const EmailRealtimeContext = createContext({});

export const useEmailRealtime = () => {
  return useContext(EmailRealtimeContext);
};

export const EmailRealtimeProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Use a unique channel name per mount to avoid duplicate subscribe in StrictMode
    const channelName = `emails_changes-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
    
    const subscription = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'emails'
        },
        () => {
          // Invalidate and refetch emails when any email changes
          queryClient.invalidateQueries({ queryKey: ["emails"] });
          queryClient.invalidateQueries({ queryKey: ["email-kpis"] });
        }
      )
      .subscribe();

    return () => {
      try {
        supabase.removeChannel(subscription);
      } catch {
        try { subscription.unsubscribe(); } catch {}
      }
    };
  }, [queryClient]);

  return (
    <EmailRealtimeContext.Provider value={{}}>
      {children}
    </EmailRealtimeContext.Provider>
  );
};
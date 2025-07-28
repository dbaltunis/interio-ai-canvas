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
    // Create a unique channel name to avoid conflicts
    const channelName = `emails_changes_${Date.now()}`;
    
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
      subscription.unsubscribe();
    };
  }, [queryClient]);

  return (
    <EmailRealtimeContext.Provider value={{}}>
      {children}
    </EmailRealtimeContext.Provider>
  );
};
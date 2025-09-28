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
        (payload) => {
          console.log('Real-time email change detected:', payload);
          // Force refresh queries immediately
          queryClient.invalidateQueries({ queryKey: ["emails"] });
          queryClient.invalidateQueries({ queryKey: ["email-kpis"] });
          queryClient.invalidateQueries({ queryKey: ["email-analytics"] });
          
          // Also force refetch to ensure immediate data update
          queryClient.refetchQueries({ queryKey: ["emails"] });
          queryClient.refetchQueries({ queryKey: ["email-kpis"] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'email_analytics'
        },
        (payload) => {
          console.log('Real-time email analytics change detected:', payload);
          // Invalidate and refetch on analytics changes too
          queryClient.invalidateQueries({ queryKey: ["emails"] });
          queryClient.invalidateQueries({ queryKey: ["email-kpis"] });
          queryClient.invalidateQueries({ queryKey: ["email-analytics"] });
          queryClient.refetchQueries({ queryKey: ["emails"] });
        }
      )
      .subscribe();

    // Periodic status checker - run every 5 minutes
    const statusCheckerInterval = setInterval(async () => {
      try {
        console.log('Running periodic email status check...');
        await supabase.functions.invoke('email-status-checker');
      } catch (error) {
        console.warn('Failed to run email status checker:', error);
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => {
      try {
        supabase.removeChannel(subscription);
        clearInterval(statusCheckerInterval);
      } catch {
        try { 
          subscription.unsubscribe(); 
          clearInterval(statusCheckerInterval);
        } catch {}
      }
    };
  }, [queryClient]);

  return (
    <EmailRealtimeContext.Provider value={{}}>
      {children}
    </EmailRealtimeContext.Provider>
  );
};
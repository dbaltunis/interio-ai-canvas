
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Email } from "./useEmails";

export const useClientEmails = (clientId: string | null) => {
  return useQuery({
    queryKey: ['client-emails', clientId],
    queryFn: async () => {
      if (!clientId) return [];
      
      const { data, error } = await supabase
        .from('emails')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Email[];
    },
    enabled: !!clientId,
  });
};

// Hook to get email statistics for all clients
export const useAllClientEmailStats = () => {
  return useQuery({
    queryKey: ['all-client-email-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('emails')
        .select('client_id, status, open_count, click_count, created_at')
        .not('client_id', 'is', null);
      
      if (error) throw error;
      
      // Group emails by client_id and calculate stats
      const statsMap = new Map();
      
      data.forEach(email => {
        const clientId = email.client_id;
        if (!statsMap.has(clientId)) {
          statsMap.set(clientId, {
            totalEmails: 0,
            sentEmails: 0,
            openedEmails: 0,
            clickedEmails: 0,
            lastEmailDate: null,
            totalOpens: 0,
            totalClicks: 0
          });
        }
        
        const stats = statsMap.get(clientId);
        stats.totalEmails++;
        
        if (!['draft', 'queued'].includes(email.status)) {
          stats.sentEmails++;
        }
        
        if (email.open_count > 0) {
          stats.openedEmails++;
          stats.totalOpens += email.open_count;
        }
        
        if (email.click_count > 0) {
          stats.clickedEmails++;
          stats.totalClicks += email.click_count;
        }
        
        if (!stats.lastEmailDate || new Date(email.created_at) > new Date(stats.lastEmailDate)) {
          stats.lastEmailDate = email.created_at;
        }
      });
      
      return Object.fromEntries(statsMap);
    },
  });
};

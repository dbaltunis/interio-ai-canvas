
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useClientEmails = (clientId: string) => {
  return useQuery({
    queryKey: ["client-emails", clientId],
    queryFn: async () => {
      console.log('useClientEmails: Fetching emails for client', clientId);
      
      // First, get the client's email address
      const { data: client, error: clientError } = await supabase
        .from("clients")
        .select("email")
        .eq("id", clientId)
        .single();

      if (clientError) {
        console.error('useClientEmails: Error fetching client:', clientError);
        throw clientError;
      }

      console.log('useClientEmails: Client email found:', client?.email);

      // Query emails that are either:
      // 1. Directly linked to this client (client_id matches)
      // 2. Sent to this client's email address (for backward compatibility)
      const { data, error } = await supabase
        .from("emails")
        .select("*")
        .or(`client_id.eq.${clientId}${client?.email ? `,and(client_id.is.null,recipient_email.eq.${client.email})` : ''}`)
        .order("created_at", { ascending: false });

      if (error) {
        console.error('useClientEmails: Error fetching emails:', error);
        throw error;
      }
      
      console.log('useClientEmails: Found emails:', data?.length || 0);
      return data || [];
    },
    enabled: !!clientId,
  });
};

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffectiveAccountOwner } from "./useEffectiveAccountOwner";

export interface WhatsAppMessage {
  id: string;
  client_id: string | null;
  project_id: string | null;
  to_number: string;
  message_body: string;
  media_url: string | null;
  status: string;
  twilio_message_sid: string | null;
  created_at: string;
  status_updated_at: string | null;
}

export const useClientWhatsAppMessages = (clientId: string | undefined) => {
  const { effectiveOwnerId } = useEffectiveAccountOwner();

  return useQuery({
    queryKey: ["client-whatsapp-messages", effectiveOwnerId, clientId],
    queryFn: async () => {
      if (!clientId || !effectiveOwnerId) return [];

      const { data, error } = await supabase
        .from("whatsapp_message_logs")
        .select("*")
        .eq("client_id", clientId)
        .eq("account_owner_id", effectiveOwnerId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching WhatsApp messages:", error);
        throw error;
      }

      return data as WhatsAppMessage[];
    },
    enabled: !!clientId && !!effectiveOwnerId,
    staleTime: 2 * 60 * 1000,
  });
};

export const useProjectWhatsAppMessages = (projectId: string | undefined) => {
  const { effectiveOwnerId } = useEffectiveAccountOwner();

  return useQuery({
    queryKey: ["project-whatsapp-messages", effectiveOwnerId, projectId],
    queryFn: async () => {
      if (!projectId || !effectiveOwnerId) return [];

      const { data, error } = await supabase
        .from("whatsapp_message_logs")
        .select("*")
        .eq("project_id", projectId)
        .eq("account_owner_id", effectiveOwnerId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching project WhatsApp messages:", error);
        throw error;
      }

      return data as WhatsAppMessage[];
    },
    enabled: !!projectId && !!effectiveOwnerId,
    staleTime: 2 * 60 * 1000,
  });
};

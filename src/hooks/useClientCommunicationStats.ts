import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffectiveAccountOwner } from "./useEffectiveAccountOwner";

export interface ClientCommunicationStats {
  clientId: string;
  emailCount: number;
  whatsappCount: number;
  totalCount: number;
  lastContactAt: string | null;
}

export const useClientCommunicationStats = (clientIds: string[]) => {
  const { effectiveOwnerId } = useEffectiveAccountOwner();

  return useQuery({
    queryKey: ["client-communication-stats", effectiveOwnerId, clientIds],
    queryFn: async (): Promise<Record<string, ClientCommunicationStats>> => {
      if (!effectiveOwnerId || clientIds.length === 0) return {};

      // Fetch email counts per client
      const { data: emailData, error: emailError } = await supabase
        .from("emails")
        .select("client_id, created_at")
        .eq("user_id", effectiveOwnerId)
        .in("client_id", clientIds);

      if (emailError) {
        console.error("Error fetching email stats:", emailError);
      }

      // Fetch WhatsApp counts per client
      const { data: whatsappData, error: whatsappError } = await supabase
        .from("whatsapp_message_logs")
        .select("client_id, created_at")
        .eq("account_owner_id", effectiveOwnerId)
        .in("client_id", clientIds);

      if (whatsappError) {
        console.error("Error fetching WhatsApp stats:", whatsappError);
      }

      // Aggregate stats per client
      const stats: Record<string, ClientCommunicationStats> = {};

      clientIds.forEach((clientId) => {
        const clientEmails = emailData?.filter((e) => e.client_id === clientId) || [];
        const clientWhatsapp = whatsappData?.filter((w) => w.client_id === clientId) || [];

        // Find most recent contact
        const allDates = [
          ...clientEmails.map((e) => e.created_at),
          ...clientWhatsapp.map((w) => w.created_at),
        ].filter(Boolean);

        const lastContactAt = allDates.length > 0
          ? allDates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0]
          : null;

        stats[clientId] = {
          clientId,
          emailCount: clientEmails.length,
          whatsappCount: clientWhatsapp.length,
          totalCount: clientEmails.length + clientWhatsapp.length,
          lastContactAt,
        };
      });

      return stats;
    },
    enabled: !!effectiveOwnerId && clientIds.length > 0,
    staleTime: 2 * 60 * 1000,
  });
};

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffectiveAccountOwner } from "./useEffectiveAccountOwner";

export interface ProjectCommunicationStats {
  projectId: string;
  emailCount: number;
  whatsappCount: number;
  totalCount: number;
  lastContactAt: string | null;
}

interface ProjectInfo {
  projectId: string;
  clientId: string | null;
}

export const useProjectCommunicationStats = (projectsInfo: ProjectInfo[]) => {
  const { effectiveOwnerId } = useEffectiveAccountOwner();

  const projectIds = projectsInfo.map(p => p.projectId);
  const clientIds = projectsInfo.map(p => p.clientId).filter(Boolean) as string[];

  return useQuery({
    queryKey: ["project-communication-stats", effectiveOwnerId, projectIds],
    queryFn: async (): Promise<Record<string, ProjectCommunicationStats>> => {
      if (!effectiveOwnerId || projectIds.length === 0) return {};

      // Fetch email counts per client (emails don't have project_id, but have client_id)
      const emailPromise = clientIds.length > 0 
        ? supabase
            .from("emails")
            .select("client_id, created_at")
            .eq("user_id", effectiveOwnerId)
            .in("client_id", clientIds)
        : Promise.resolve({ data: [], error: null });

      // Fetch WhatsApp counts per project
      const whatsappPromise = supabase
        .from("whatsapp_message_logs")
        .select("project_id, client_id, created_at")
        .eq("account_owner_id", effectiveOwnerId)
        .in("project_id", projectIds);

      const [emailResult, whatsappResult] = await Promise.all([emailPromise, whatsappPromise]);

      if (emailResult.error) {
        console.error("Error fetching project email stats:", emailResult.error);
      }
      if (whatsappResult.error) {
        console.error("Error fetching project WhatsApp stats:", whatsappResult.error);
      }

      const emailData = emailResult.data || [];
      const whatsappData = whatsappResult.data || [];

      // Aggregate stats per project
      const stats: Record<string, ProjectCommunicationStats> = {};

      projectsInfo.forEach(({ projectId, clientId }) => {
        // Emails are associated via client_id
        const projectEmails = clientId ? emailData.filter((e: any) => e.client_id === clientId) : [];
        // WhatsApp messages are associated via project_id
        const projectWhatsapp = whatsappData.filter((w: any) => w.project_id === projectId);

        // Find most recent contact
        const allDates = [
          ...projectEmails.map((e: any) => e.created_at),
          ...projectWhatsapp.map((w: any) => w.created_at),
        ].filter(Boolean);

        const lastContactAt = allDates.length > 0
          ? allDates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0]
          : null;

        stats[projectId] = {
          projectId,
          emailCount: projectEmails.length,
          whatsappCount: projectWhatsapp.length,
          totalCount: projectEmails.length + projectWhatsapp.length,
          lastContactAt,
        };
      });

      return stats;
    },
    enabled: !!effectiveOwnerId && projectIds.length > 0,
    staleTime: 2 * 60 * 1000,
  });
};

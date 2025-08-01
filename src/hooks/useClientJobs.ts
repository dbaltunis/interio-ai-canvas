
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useClientStats = () => {
  return useQuery({
    queryKey: ["client-stats"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Get all clients with their associated projects and quotes
      const { data: clients, error } = await supabase
        .from("clients")
        .select(`
          id,
          name,
          company_name,
          funnel_stage,
          projects (
            id,
            name,
            status
          ),
          quotes (
            id,
            total_amount,
            status
          )
        `)
        .eq("user_id", user.id);

      if (error) throw error;

      // Calculate stats for each client
      const clientStats = clients?.map(client => {
        const projectCount = client.projects?.length || 0;
        const totalValue = client.quotes?.reduce((sum, quote) => {
          return sum + (parseFloat(quote.total_amount?.toString() || '0'));
        }, 0) || 0;

        return {
          clientId: client.id,
          name: client.name,
          companyName: client.company_name,
          funnelStage: client.funnel_stage,
          projectCount,
          totalValue
        };
      }) || [];

      return clientStats;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useClientJobs = (clientId: string) => {
  return useQuery({
    queryKey: ["client-jobs", clientId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: projects, error } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", user.id)
        .eq("client_id", clientId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return projects || [];
    },
    enabled: !!clientId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useClientEmails = (clientId: string) => {
  return useQuery({
    queryKey: ["client-emails", clientId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: emails, error } = await supabase
        .from("emails")
        .select("*")
        .eq("user_id", user.id)
        .eq("client_id", clientId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return emails || [];
    },
    enabled: !!clientId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

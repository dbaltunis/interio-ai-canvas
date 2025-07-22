
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

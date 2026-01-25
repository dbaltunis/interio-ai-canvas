import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";

interface DealerStats {
  activeProjects: number;
  pendingQuotes: number;
  totalClients: number;
}

/**
 * Hook to fetch dealer-specific statistics for the dealer dashboard
 * Only fetches data belonging to the current dealer user
 */
export const useDealerStats = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["dealer-stats", user?.id],
    queryFn: async (): Promise<DealerStats> => {
      if (!user) {
        return { activeProjects: 0, pendingQuotes: 0, totalClients: 0 };
      }

      // Fetch all stats in parallel for better performance
      const [projectsResult, quotesResult, clientsResult] = await Promise.all([
        // Active projects count (exclude completed/cancelled)
        supabase
          .from("projects")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .not("status", "in", "(completed,cancelled)"),

        // Pending quotes count (draft or sent status)
        supabase
          .from("quotes")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .in("status", ["draft", "sent", "pending"]),

        // Total clients assigned to this dealer
        supabase
          .from("clients")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id),
      ]);

      return {
        activeProjects: projectsResult.count || 0,
        pendingQuotes: quotesResult.count || 0,
        totalClients: clientsResult.count || 0,
      };
    },
    enabled: !!user,
    staleTime: 30 * 1000, // Cache for 30 seconds
  });
};

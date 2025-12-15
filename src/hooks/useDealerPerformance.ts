import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";

export interface DealerPerformanceData {
  id: string;
  name: string;
  role: string;
  avatar_url?: string;
  totalQuotes: number;
  totalValue: number;
  acceptedQuotes: number;
  conversionRate: number;
  activeProjects: number;
  avgDealSize: number;
  trend: "up" | "down" | "neutral";
}

export interface DealerPerformanceSummary {
  topPerformer: DealerPerformanceData | null;
  totalTeamRevenue: number;
  avgConversionRate: number;
  totalActiveProjects: number;
}

export const useDealerPerformance = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["dealer-performance", user?.id],
    queryFn: async (): Promise<{
      dealers: DealerPerformanceData[];
      summary: DealerPerformanceSummary;
    }> => {
      if (!user?.id) {
        return {
          dealers: [],
          summary: {
            topPerformer: null,
            totalTeamRevenue: 0,
            avgConversionRate: 0,
            totalActiveProjects: 0,
          },
        };
      }

      // Get current user's profile to find account scope
      const { data: currentProfile } = await supabase
        .from("user_profiles")
        .select("user_id, parent_account_id")
        .eq("user_id", user.id)
        .single();

      const accountOwnerId = currentProfile?.parent_account_id || user.id;

      // Get all team members in the same account
      const { data: teamMembers, error: teamError } = await supabase
        .from("user_profiles")
        .select("user_id, display_name, role, avatar_url")
        .or(`user_id.eq.${accountOwnerId},parent_account_id.eq.${accountOwnerId}`)
        .eq("is_active", true);

      if (teamError) throw teamError;
      if (!teamMembers || teamMembers.length === 0) {
        return {
          dealers: [],
          summary: {
            topPerformer: null,
            totalTeamRevenue: 0,
            avgConversionRate: 0,
            totalActiveProjects: 0,
          },
        };
      }

      const teamUserIds = teamMembers.map((m) => m.user_id);

      // Get quotes for all team members
      const { data: quotes, error: quotesError } = await supabase
        .from("quotes")
        .select("id, user_id, total_amount, status, created_at")
        .in("user_id", teamUserIds);

      if (quotesError) throw quotesError;

      // Get active projects for all team members
      const { data: projects, error: projectsError } = await supabase
        .from("projects")
        .select("id, user_id, status")
        .in("user_id", teamUserIds)
        .not("status", "in", '("completed","cancelled","invoiced")');

      if (projectsError) throw projectsError;

      // Status values that indicate a "won" quote (case-insensitive matching)
      const wonStatuses = ['accepted', 'approved', 'won', 'order', 'in-progress', 'completed', 'invoiced', 'paid'];
      
      // Calculate performance metrics for each team member
      const dealerData: DealerPerformanceData[] = teamMembers.map((member) => {
        const memberQuotes = quotes?.filter((q) => q.user_id === member.user_id) || [];
        const memberProjects = projects?.filter((p) => p.user_id === member.user_id) || [];

        const totalQuotes = memberQuotes.length;
        
        // Check for won quotes (case-insensitive)
        const wonQuotes = memberQuotes.filter((q) => 
          wonStatuses.some(s => q.status?.toLowerCase() === s.toLowerCase())
        );
        const acceptedQuotes = wonQuotes.length;
        
        // Revenue from won quotes
        const wonValue = wonQuotes.reduce((sum, q) => sum + (q.total_amount || 0), 0);
        
        // Total pipeline value (all quotes)
        const pipelineValue = memberQuotes.reduce((sum, q) => sum + (q.total_amount || 0), 0);
        
        // Use pipeline value if no won quotes yet, for visibility
        const totalValue = wonValue > 0 ? wonValue : pipelineValue;
        
        const conversionRate = totalQuotes > 0 ? (acceptedQuotes / totalQuotes) * 100 : 0;
        const avgDealSize = totalQuotes > 0 ? pipelineValue / totalQuotes : 0;

        // Calculate trend based on recent activity (simplified)
        const recentQuotes = memberQuotes.filter((q) => {
          const date = new Date(q.created_at);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return date >= thirtyDaysAgo;
        });
        const trend: "up" | "down" | "neutral" =
          recentQuotes.length >= 3 ? "up" : recentQuotes.length === 0 ? "down" : "neutral";

        return {
          id: member.user_id,
          name: member.display_name || "Unknown",
          role: member.role || "Staff",
          avatar_url: member.avatar_url || undefined,
          totalQuotes,
          totalValue,
          acceptedQuotes,
          conversionRate,
          activeProjects: memberProjects.length,
          avgDealSize,
          trend,
        };
      });

      // Sort by total value (revenue)
      const sortedDealers = dealerData.sort((a, b) => b.totalValue - a.totalValue);

      // Calculate summary
      const totalTeamRevenue = dealerData.reduce((sum, d) => sum + d.totalValue, 0);
      const avgConversionRate =
        dealerData.length > 0
          ? dealerData.reduce((sum, d) => sum + d.conversionRate, 0) / dealerData.length
          : 0;
      const totalActiveProjects = dealerData.reduce((sum, d) => sum + d.activeProjects, 0);

      return {
        dealers: sortedDealers,
        summary: {
          topPerformer: sortedDealers[0] || null,
          totalTeamRevenue,
          avgConversionRate,
          totalActiveProjects,
        },
      };
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

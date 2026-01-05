import { useQueries } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffectiveAccountOwner } from "@/hooks/useEffectiveAccountOwner";
import { useDashboardDate } from "@/contexts/DashboardDateContext";
import { format } from "date-fns";

// Status names that count as revenue (case-insensitive comparison)
const REVENUE_STATUS_NAMES = ['order confirmed', 'approved', 'completed', 'in production', 'installed'];
// Status names considered terminal/inactive (projects with these don't count as "active")
const TERMINAL_STATUS_NAMES = ['completed', 'cancelled', 'closed', 'on hold'];

/**
 * Batched dashboard queries for better performance
 * Fetches all critical dashboard data in parallel with optimized queries
 * Uses effectiveOwnerId for multi-tenant support (team members see account owner's data)
 * Now filters by dateRange from global dashboard context
 */
export const useBatchedDashboardQueries = () => {
  const { effectiveOwnerId } = useEffectiveAccountOwner();
  const { dateRange } = useDashboardDate();
  
  // Format dates for Supabase queries
  const startDateStr = dateRange.startDate ? format(dateRange.startDate, "yyyy-MM-dd") : null;
  const endDateStr = dateRange.endDate ? format(dateRange.endDate, "yyyy-MM-dd'T'23:59:59") : null;
  
  const results = useQueries({
    queries: [
      // Critical stats - needed immediately, filtered by date range
      {
        queryKey: ["dashboard-stats-critical", effectiveOwnerId, startDateStr, endDateStr],
        queryFn: async () => {
          if (!effectiveOwnerId) throw new Error("No authenticated user");

          // First, get status IDs for revenue-qualifying and terminal statuses
          const { data: allStatuses } = await supabase
            .from("job_statuses")
            .select("id, name")
            .eq("user_id", effectiveOwnerId);

          const revenueStatusIds = allStatuses
            ?.filter(s => REVENUE_STATUS_NAMES.includes(s.name.toLowerCase()))
            .map(s => s.id) || [];
          
          const terminalStatusIds = allStatuses
            ?.filter(s => TERMINAL_STATUS_NAMES.includes(s.name.toLowerCase()))
            .map(s => s.id) || [];

          // Build date-filtered queries
          let clientsQuery = supabase.from("clients").select("*", { count: "exact", head: true }).eq("user_id", effectiveOwnerId);
          let quotesQuery = supabase.from("quotes").select("*", { count: "exact", head: true }).eq("user_id", effectiveOwnerId).in("status", ["draft", "sent"]);
          
          // Apply date filters if available
          if (startDateStr) {
            clientsQuery = clientsQuery.gte("created_at", startDateStr);
            quotesQuery = quotesQuery.gte("created_at", startDateStr);
          }
          if (endDateStr) {
            clientsQuery = clientsQuery.lte("created_at", endDateStr);
            quotesQuery = quotesQuery.lte("created_at", endDateStr);
          }

          // Revenue query with date filter
          let revenueQuery = revenueStatusIds.length > 0 
            ? supabase
                .from("projects")
                .select("quotes(total_amount), created_at")
                .eq("user_id", effectiveOwnerId)
                .in("status_id", revenueStatusIds)
            : null;
          
          if (revenueQuery && startDateStr) {
            revenueQuery = revenueQuery.gte("created_at", startDateStr);
          }
          if (revenueQuery && endDateStr) {
            revenueQuery = revenueQuery.lte("created_at", endDateStr);
          }

          // Active projects query with date filter
          let activeProjectsQuery = terminalStatusIds.length > 0
            ? supabase
                .from("projects")
                .select("*", { count: "exact", head: true })
                .eq("user_id", effectiveOwnerId)
                .not("status_id", "in", `(${terminalStatusIds.join(",")})`)
            : supabase
                .from("projects")
                .select("*", { count: "exact", head: true })
                .eq("user_id", effectiveOwnerId);
          
          if (startDateStr) {
            activeProjectsQuery = activeProjectsQuery.gte("created_at", startDateStr);
          }
          if (endDateStr) {
            activeProjectsQuery = activeProjectsQuery.lte("created_at", endDateStr);
          }

          const [clientsResult, quotesResult, revenueResult, activeProjectsResult] = await Promise.allSettled([
            clientsQuery,
            quotesQuery,
            revenueQuery || Promise.resolve({ data: [] }),
            activeProjectsQuery,
          ]);

          const totalClients = clientsResult.status === 'fulfilled' ? (clientsResult.value.count || 0) : 0;
          const pendingQuotes = quotesResult.status === 'fulfilled' ? (quotesResult.value.count || 0) : 0;
          
          // Calculate total revenue from projects with revenue-qualifying statuses
          let totalRevenue = 0;
          if (revenueResult.status === 'fulfilled' && revenueResult.value.data) {
            revenueResult.value.data.forEach((project: any) => {
              if (project.quotes) {
                // quotes can be an object or array depending on the relationship
                const quotes = Array.isArray(project.quotes) ? project.quotes : [project.quotes];
                quotes.forEach((quote: any) => {
                  if (quote?.total_amount) {
                    totalRevenue += quote.total_amount;
                  }
                });
              }
            });
          }

          const activeProjects = activeProjectsResult.status === 'fulfilled' ? (activeProjectsResult.value.count || 0) : 0;

          return { totalClients, pendingQuotes, totalRevenue, activeProjects };
        },
        staleTime: 30 * 1000, // 30 seconds for more responsive updates
        gcTime: 5 * 60 * 1000,
        enabled: !!effectiveOwnerId,
      },
      // Secondary stats - can load after critical
      {
        queryKey: ["dashboard-stats-secondary", effectiveOwnerId],
        queryFn: async () => {
          if (!effectiveOwnerId) throw new Error("No authenticated user");

          const [inventoryResult, appointmentsResult, schedulersResult] = await Promise.allSettled([
            supabase.from("inventory").select("*", { count: "exact", head: true }).eq("user_id", effectiveOwnerId).or("quantity.lte.reorder_point,reorder_point.is.null.and.quantity.lte.5"),
            supabase.from("appointments_booked").select("*", { count: "exact", head: true }).eq("status", "confirmed"),
            supabase.from("appointment_schedulers").select("*", { count: "exact", head: true }).eq("user_id", effectiveOwnerId).eq("active", true)
          ]);

          return {
            lowStockItems: inventoryResult.status === 'fulfilled' ? (inventoryResult.value.count || 0) : 0,
            totalAppointments: appointmentsResult.status === 'fulfilled' ? (appointmentsResult.value.count || 0) : 0,
            activeSchedulers: schedulersResult.status === 'fulfilled' ? (schedulersResult.value.count || 0) : 0,
          };
        },
        staleTime: 5 * 60 * 1000, // 5 minutes for secondary stats
        gcTime: 10 * 60 * 1000,
        enabled: !!effectiveOwnerId,
      },
      // Online store check - needed for widgets
      {
        queryKey: ['has-online-store', effectiveOwnerId],
        queryFn: async () => {
          if (!effectiveOwnerId) return false;
          const { data } = await supabase
            .from('online_stores')
            .select('id, is_published')
            .eq('user_id', effectiveOwnerId)
            .maybeSingle();
          return !!data;
        },
        staleTime: 10 * 60 * 1000, // 10 minutes - store status doesn't change often
        gcTime: 30 * 60 * 1000,
        enabled: !!effectiveOwnerId,
      },
    ],
  });

  const [criticalStats, secondaryStats, onlineStore] = results;

  return {
    criticalStats: {
      data: criticalStats.data,
      isLoading: criticalStats.isLoading,
      error: criticalStats.error,
    },
    secondaryStats: {
      data: secondaryStats.data,
      isLoading: secondaryStats.isLoading,
      error: secondaryStats.error,
    },
    hasOnlineStore: {
      data: onlineStore.data,
      isLoading: onlineStore.isLoading,
      error: onlineStore.error,
    },
    isLoading: criticalStats.isLoading,
    hasError: results.some(r => r.isError),
  };
};

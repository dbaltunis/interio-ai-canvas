import { useQueries } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffectiveAccountOwner } from "@/hooks/useEffectiveAccountOwner";

/**
 * Batched dashboard queries for better performance
 * Fetches all critical dashboard data in parallel with optimized queries
 * Uses effectiveOwnerId for multi-tenant support (team members see account owner's data)
 */
export const useBatchedDashboardQueries = () => {
  const { effectiveOwnerId } = useEffectiveAccountOwner();
  
  const results = useQueries({
    queries: [
      // Critical stats - needed immediately
      {
        queryKey: ["dashboard-stats-critical", effectiveOwnerId],
        queryFn: async () => {
          if (!effectiveOwnerId) throw new Error("No authenticated user");

          const [clientsResult, quotesResult, revenueResult] = await Promise.allSettled([
            supabase.from("clients").select("*", { count: "exact", head: true }).eq("user_id", effectiveOwnerId),
            supabase.from("quotes").select("*", { count: "exact", head: true }).eq("user_id", effectiveOwnerId).in("status", ["draft", "sent"]),
            supabase.from("quotes").select("total_amount").eq("user_id", effectiveOwnerId).eq("status", "accepted"),
          ]);

          const totalClients = clientsResult.status === 'fulfilled' ? (clientsResult.value.count || 0) : 0;
          const pendingQuotes = quotesResult.status === 'fulfilled' ? (quotesResult.value.count || 0) : 0;
          
          let totalRevenue = 0;
          if (revenueResult.status === 'fulfilled' && revenueResult.value.data) {
            totalRevenue = revenueResult.value.data.reduce((sum, quote) => sum + (quote.total_amount || 0), 0);
          }

          return { totalClients, pendingQuotes, totalRevenue };
        },
        staleTime: 2 * 60 * 1000, // 2 minutes for critical stats
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

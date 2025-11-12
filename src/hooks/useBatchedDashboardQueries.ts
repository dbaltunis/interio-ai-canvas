import { useQueries } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Batched dashboard queries for better performance
 * Fetches all critical dashboard data in parallel with optimized queries
 */
export const useBatchedDashboardQueries = () => {
  const results = useQueries({
    queries: [
      // Critical stats - needed immediately
      {
        queryKey: ["dashboard-stats-critical"],
        queryFn: async () => {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error("No authenticated user");

          const [clientsResult, quotesResult, revenueResult] = await Promise.allSettled([
            supabase.from("clients").select("*", { count: "exact", head: true }).eq("user_id", user.id),
            supabase.from("quotes").select("*", { count: "exact", head: true }).eq("user_id", user.id).in("status", ["draft", "sent"]),
            supabase.from("quotes").select("total_amount").eq("user_id", user.id).eq("status", "accepted"),
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
      },
      // Secondary stats - can load after critical
      {
        queryKey: ["dashboard-stats-secondary"],
        queryFn: async () => {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error("No authenticated user");

          const [inventoryResult, appointmentsResult, schedulersResult] = await Promise.allSettled([
            supabase.from("inventory").select("*", { count: "exact", head: true }).eq("user_id", user.id).or("quantity.lte.reorder_point,reorder_point.is.null.and.quantity.lte.5"),
            supabase.from("appointments_booked").select("*", { count: "exact", head: true }).eq("status", "confirmed"),
            supabase.from("appointment_schedulers").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("active", true)
          ]);

          return {
            lowStockItems: inventoryResult.status === 'fulfilled' ? (inventoryResult.value.count || 0) : 0,
            totalAppointments: appointmentsResult.status === 'fulfilled' ? (appointmentsResult.value.count || 0) : 0,
            activeSchedulers: schedulersResult.status === 'fulfilled' ? (schedulersResult.value.count || 0) : 0,
          };
        },
        staleTime: 5 * 60 * 1000, // 5 minutes for secondary stats
        gcTime: 10 * 60 * 1000,
        // Delay secondary stats slightly
        enabled: true,
      },
      // Online store check - needed for widgets
      {
        queryKey: ['has-online-store'],
        queryFn: async () => {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return false;
          const { data } = await supabase
            .from('online_stores')
            .select('id, is_published')
            .eq('user_id', user.id)
            .maybeSingle();
          return !!data;
        },
        staleTime: 10 * 60 * 1000, // 10 minutes - store status doesn't change often
        gcTime: 30 * 60 * 1000,
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

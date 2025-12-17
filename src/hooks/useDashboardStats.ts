import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffectiveAccountOwner } from "@/hooks/useEffectiveAccountOwner";

export const useDashboardStats = () => {
  const { effectiveOwnerId } = useEffectiveAccountOwner();
  
  return useQuery({
    queryKey: ["dashboard-stats", effectiveOwnerId],
    queryFn: async () => {
      if (!effectiveOwnerId) throw new Error("No authenticated user");

      // Use Promise.allSettled to avoid failing if one query fails
      const [clientsResult, quotesResult, inventoryResult, revenueResult, appointmentsResult, schedulersResult] = await Promise.allSettled([
        supabase.from("clients").select("*", { count: "exact", head: true }).eq("user_id", effectiveOwnerId),
        supabase.from("quotes").select("*", { count: "exact", head: true }).eq("user_id", effectiveOwnerId).in("status", ["draft", "sent"]),
        supabase.from("inventory").select("*", { count: "exact", head: true }).eq("user_id", effectiveOwnerId).or("quantity.lte.reorder_point,reorder_point.is.null.and.quantity.lte.5"),
        supabase.from("quotes").select("total_amount").eq("user_id", effectiveOwnerId).eq("status", "accepted"),
        supabase.from("appointments_booked").select("*", { count: "exact", head: true }).eq("status", "confirmed"),
        supabase.from("appointment_schedulers").select("*", { count: "exact", head: true }).eq("user_id", effectiveOwnerId).eq("active", true)
      ]);

      const totalClients = clientsResult.status === 'fulfilled' ? (clientsResult.value.count || 0) : 0;
      const pendingQuotes = quotesResult.status === 'fulfilled' ? (quotesResult.value.count || 0) : 0;
      const lowStockItems = inventoryResult.status === 'fulfilled' ? (inventoryResult.value.count || 0) : 0;
      const totalAppointments = appointmentsResult.status === 'fulfilled' ? (appointmentsResult.value.count || 0) : 0;
      const activeSchedulers = schedulersResult.status === 'fulfilled' ? (schedulersResult.value.count || 0) : 0;
      
      let totalRevenue = 0;
      if (revenueResult.status === 'fulfilled' && revenueResult.value.data) {
        totalRevenue = revenueResult.value.data.reduce((sum, quote) => sum + (quote.total_amount || 0), 0);
      }

      return {
        totalClients,
        pendingQuotes,
        lowStockItems,
        totalRevenue,
        totalAppointments,
        activeSchedulers,
      };
    },
    enabled: !!effectiveOwnerId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

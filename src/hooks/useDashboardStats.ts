
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      // Use Promise.allSettled to avoid failing if one query fails
      const [clientsResult, quotesResult, inventoryResult, revenueResult] = await Promise.allSettled([
        supabase.from("clients").select("*", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("quotes").select("*", { count: "exact", head: true }).eq("user_id", user.id).in("status", ["draft", "sent"]),
        supabase.from("inventory").select("*", { count: "exact", head: true }).eq("user_id", user.id).or("quantity.lte.reorder_point,reorder_point.is.null.and.quantity.lte.5"),
        supabase.from("quotes").select("total_amount").eq("user_id", user.id).eq("status", "accepted")
      ]);

      const totalClients = clientsResult.status === 'fulfilled' ? (clientsResult.value.count || 0) : 0;
      const pendingQuotes = quotesResult.status === 'fulfilled' ? (quotesResult.value.count || 0) : 0;
      const lowStockItems = inventoryResult.status === 'fulfilled' ? (inventoryResult.value.count || 0) : 0;
      
      let totalRevenue = 0;
      if (revenueResult.status === 'fulfilled' && revenueResult.value.data) {
        totalRevenue = revenueResult.value.data.reduce((sum, quote) => sum + (quote.total_amount || 0), 0);
      }

      return {
        totalClients,
        pendingQuotes,
        lowStockItems,
        totalRevenue,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

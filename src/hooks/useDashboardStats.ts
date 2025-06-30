
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      // Get total clients
      const { count: totalClients } = await supabase
        .from("clients")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      // Get pending quotes
      const { count: pendingQuotes } = await supabase
        .from("quotes")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .in("status", ["draft", "sent"]);

      // Get low stock items
      const { count: lowStockItems } = await supabase
        .from("inventory")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .or("quantity.lte.reorder_point,reorder_point.is.null.and.quantity.lte.5");

      // Get total revenue (from accepted quotes)
      const { data: acceptedQuotes } = await supabase
        .from("quotes")
        .select("total_amount")
        .eq("user_id", user.id)
        .eq("status", "accepted");

      const totalRevenue = acceptedQuotes?.reduce((sum, quote) => sum + (quote.total_amount || 0), 0) || 0;

      return {
        totalClients: totalClients || 0,
        pendingQuotes: pendingQuotes || 0,
        lowStockItems: lowStockItems || 0,
        totalRevenue,
      };
    },
  });
};

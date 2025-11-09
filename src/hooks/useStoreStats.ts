import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useStoreStats = (storeId?: string) => {
  return useQuery({
    queryKey: ['store-stats', storeId],
    queryFn: async () => {
      if (!storeId) return null;

      // Get inquiry counts
      const { data: inquiries } = await supabase
        .from('store_inquiries')
        .select('id, status, created_at')
        .eq('store_id', storeId);

      // Get product count
      const { count: productCount } = await supabase
        .from('store_product_visibility')
        .select('*', { count: 'exact', head: true })
        .eq('store_id', storeId)
        .eq('is_visible', true);

      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const newInquiries = inquiries?.filter(
        (inq) => new Date(inq.created_at) >= sevenDaysAgo && inq.status === 'new'
      ).length || 0;

      const totalQuoteRequests = inquiries?.filter(
        (inq) => inq.status !== 'closed'
      ).length || 0;

      return {
        newInquiries,
        totalQuoteRequests,
        productCount: productCount || 0,
        recentInquiries: inquiries?.slice(0, 5) || [],
      };
    },
    enabled: !!storeId,
  });
};

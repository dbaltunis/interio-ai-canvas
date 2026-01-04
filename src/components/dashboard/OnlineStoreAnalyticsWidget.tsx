import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Eye, ShoppingCart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const OnlineStoreAnalyticsWidget = () => {
  const { data: analytics } = useQuery({
    queryKey: ['online-store-analytics'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { visitors: 0, inquiries: 0 };

      // Get store ID
      const { data: store } = await supabase
        .from('online_stores')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!store) return { visitors: 0, inquiries: 0 };

      // Get inquiry count
      const { count: inquiryCount } = await supabase
        .from('store_inquiries')
        .select('*', { count: 'exact', head: true })
        .eq('store_id', store.id);

      // TODO: Add actual visitor tracking when analytics is implemented
      return { 
        visitors: 0, // Will be implemented with analytics tracking
        inquiries: inquiryCount || 0 
      };
    },
  });

  return (
    <Card variant="analytics" className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <BarChart3 className="h-4 w-4" />
            Store Analytics
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg border border-border bg-background">
            <div className="flex items-center gap-1.5 mb-1">
              <Eye className="h-3 w-3 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Visitors</p>
            </div>
            <p className="text-xl font-bold">{analytics?.visitors || 0}</p>
            <p className="text-xs text-muted-foreground">Coming soon</p>
          </div>
          <div className="p-3 rounded-lg border border-border bg-background">
            <div className="flex items-center gap-1.5 mb-1">
              <ShoppingCart className="h-3 w-3 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Inquiries</p>
            </div>
            <p className="text-xl font-bold">{analytics?.inquiries || 0}</p>
            <p className="text-xs text-muted-foreground">Total received</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Eye, EyeOff } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const OnlineStoreProductsWidget = () => {
  const { data: productStats } = useQuery({
    queryKey: ['online-store-product-stats'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { total: 0, visible: 0, hidden: 0 };

      // Get store ID
      const { data: store } = await supabase
        .from('online_stores')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!store) return { total: 0, visible: 0, hidden: 0 };

      // Get product visibility stats
      const { data: products } = await supabase
        .from('store_product_visibility')
        .select('is_visible')
        .eq('store_id', store.id);

      const visible = products?.filter(p => p.is_visible).length || 0;
      const total = products?.length || 0;
      const hidden = total - visible;

      return { total, visible, hidden };
    },
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Products Online</CardTitle>
        <Package className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <p className="text-3xl font-bold">{productStats?.visible || 0}</p>
            <p className="text-xs text-muted-foreground">Products visible</p>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-green-500" />
              <span className="text-muted-foreground">Visible</span>
            </div>
            <span className="font-medium">{productStats?.visible || 0}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <EyeOff className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Hidden</span>
            </div>
            <span className="font-medium">{productStats?.hidden || 0}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

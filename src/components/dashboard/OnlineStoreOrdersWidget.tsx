import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

export const OnlineStoreOrdersWidget = () => {
  const { data: inquiries } = useQuery({
    queryKey: ['online-store-recent-inquiries'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Get store ID
      const { data: store } = await supabase
        .from('online_stores')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!store) return [];

      // Get recent inquiries
      const { data } = await supabase
        .from('store_inquiries')
        .select('*')
        .eq('store_id', store.id)
        .order('created_at', { ascending: false })
        .limit(3);

      return data || [];
    },
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Recent Inquiries</CardTitle>
        <Package className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {!inquiries || inquiries.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No inquiries yet
          </p>
        ) : (
          <div className="space-y-3">
            {inquiries.map((inquiry) => (
              <div key={inquiry.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                <div className="space-y-1">
                  <p className="text-sm font-medium">{inquiry.customer_name}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {inquiry.inquiry_type.replace(/_/g, ' ')}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant="outline" className="text-xs capitalize">
                    {inquiry.status}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(inquiry.created_at), { addSuffix: true })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

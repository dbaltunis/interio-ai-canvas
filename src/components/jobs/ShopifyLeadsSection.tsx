import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingBag, DollarSign, User, Calendar, ExternalLink } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

interface ShopifyOrder {
  id: string;
  order_number: number;
  customer_name: string;
  customer_email: string;
  total_price: number;
  financial_status: string;
  fulfillment_status: string | null;
  created_at: string;
  line_items: any[];
}

export const ShopifyLeadsSection = () => {
  const { toast } = useToast();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['shopify-orders'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Fetch Shopify orders from your database
      // This assumes you have a table storing synced orders
      const { data, error } = await supabase
        .from('shopify_analytics')
        .select('analytics_data')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      
      // Extract recent orders from analytics_data
      const analyticsData = data?.analytics_data as any;
      const recentOrders = analyticsData?.recent_orders || [];
      return recentOrders.slice(0, 10);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-500/10 text-green-700 border-green-200';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-700 border-yellow-200';
      case 'refunded':
        return 'bg-red-500/10 text-red-700 border-red-200';
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-200';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            Shopify Orders
          </CardTitle>
          <CardDescription>
            Recent orders from your online store
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <ShoppingBag className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No recent orders found</p>
            <p className="text-xs mt-1">Orders will appear here once synced</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-primary" />
              Shopify Orders ({orders.length})
            </CardTitle>
            <CardDescription>
              Recent orders automatically synced from your store
            </CardDescription>
          </div>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => {
              toast({
                title: "Syncing orders",
                description: "Fetching latest orders from Shopify...",
              });
            }}
          >
            Sync Now
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {orders.map((order: ShopifyOrder) => (
            <div 
              key={order.id}
              className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">
                      Order #{order.order_number}
                    </h4>
                    <Badge 
                      variant="outline" 
                      className={getStatusColor(order.financial_status)}
                    >
                      {order.financial_status}
                    </Badge>
                    {order.fulfillment_status && (
                      <Badge variant="outline" className="text-xs">
                        {order.fulfillment_status}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {order.customer_name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(order.created_at)}
                    </span>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-bold text-lg">{formatCurrency(order.total_price)}</p>
                  <p className="text-xs text-muted-foreground">
                    {order.line_items?.length || 0} item(s)
                  </p>
                </div>
              </div>

              {/* Order Items Preview */}
              {order.line_items && order.line_items.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <ShoppingBag className="h-3 w-3" />
                    <span>
                      {order.line_items.slice(0, 2).map((item: any, idx: number) => (
                        <span key={idx}>
                          {item.title}
                          {idx < Math.min(order.line_items.length - 1, 1) && ', '}
                        </span>
                      ))}
                      {order.line_items.length > 2 && ` +${order.line_items.length - 2} more`}
                    </span>
                  </div>
                </div>
              )}

              <div className="mt-3 flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    toast({
                      title: "Convert to Job",
                      description: `Creating job for order #${order.order_number}...`,
                    });
                  }}
                >
                  <User className="h-3 w-3 mr-1" />
                  Convert to Job
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => window.open(`mailto:${order.customer_email}`, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

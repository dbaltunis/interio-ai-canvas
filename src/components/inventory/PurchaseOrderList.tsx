import { usePurchaseOrders, useUpdatePurchaseOrderStatus } from "@/hooks/usePurchaseOrders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Package, CheckCircle, XCircle, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export const PurchaseOrderList = () => {
  const { data: orders, isLoading } = usePurchaseOrders();
  const updateStatus = useUpdatePurchaseOrderStatus();

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", icon: any }> = {
      draft: { variant: "outline", icon: Clock },
      pending: { variant: "secondary", icon: Clock },
      ordered: { variant: "default", icon: Package },
      received: { variant: "default", icon: CheckCircle },
      cancelled: { variant: "destructive", icon: XCircle },
    };
    
    const { variant, icon: Icon } = variants[status] || variants.draft;
    
    return (
      <Badge variant={variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-1/3" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No purchase orders yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Card key={order.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{order.order_number}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(order.order_date), 'PPP')}
                </p>
              </div>
              {getStatusBadge(order.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Total Amount</p>
                <p className="font-semibold">${order.total_amount.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Items</p>
                <p className="font-semibold">{order.purchase_order_items?.length || 0}</p>
              </div>
            </div>

            {order.expected_delivery_date && (
              <div className="text-sm">
                <p className="text-muted-foreground">Expected Delivery</p>
                <p>{format(new Date(order.expected_delivery_date), 'PPP')}</p>
              </div>
            )}

            {order.notes && (
              <div className="text-sm">
                <p className="text-muted-foreground">Notes</p>
                <p>{order.notes}</p>
              </div>
            )}

            <div className="flex gap-2">
              {order.status === 'draft' && (
                <Button 
                  size="sm" 
                  onClick={() => updateStatus.mutate({ id: order.id, status: 'ordered' })}
                >
                  Mark as Ordered
                </Button>
              )}
              {order.status === 'ordered' && (
                <Button 
                  size="sm" 
                  onClick={() => updateStatus.mutate({ id: order.id, status: 'received' })}
                >
                  Mark as Received
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

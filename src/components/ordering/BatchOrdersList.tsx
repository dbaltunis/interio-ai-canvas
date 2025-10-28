import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Send, Truck } from "lucide-react";
import { format } from "date-fns";

interface BatchOrdersListProps {
  orders: any[];
  isLoading: boolean;
}

const statusColors = {
  draft: "secondary",
  ready: "default",
  sent: "default",
  acknowledged: "default",
  in_transit: "default",
  delivered: "default",
  completed: "default",
  cancelled: "destructive",
} as const;

const statusLabels = {
  draft: "Draft",
  ready: "Ready",
  sent: "Sent",
  acknowledged: "Acknowledged",
  in_transit: "In Transit",
  delivered: "Delivered",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const BatchOrdersList = ({ orders, isLoading }: BatchOrdersListProps) => {
  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading batch orders...</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No batch orders yet</p>
        <p className="text-sm mt-2">Create batch orders from materials in your queue</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {orders.map((order) => (
        <Card key={order.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{order.batch_number}</CardTitle>
                <CardDescription>
                  {order.suppliers?.name || 'Unknown Supplier'}
                </CardDescription>
              </div>
              <Badge variant={statusColors[order.status as keyof typeof statusColors] || "secondary"}>
                {statusLabels[order.status as keyof typeof statusLabels] || order.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Items:</span>
                <span className="font-medium">{order.total_items}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Amount:</span>
                <span className="font-medium">${order.total_amount?.toFixed(2) || '0.00'}</span>
              </div>
              {order.order_schedule_date && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Schedule Date:</span>
                  <span className="font-medium">
                    {format(new Date(order.order_schedule_date), 'MMM dd, yyyy')}
                  </span>
                </div>
              )}
              {order.sent_date && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sent:</span>
                  <span className="font-medium">
                    {format(new Date(order.sent_date), 'MMM dd, yyyy')}
                  </span>
                </div>
              )}
              {order.expected_delivery_date && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Expected Delivery:</span>
                  <span className="font-medium">
                    {format(new Date(order.expected_delivery_date), 'MMM dd, yyyy')}
                  </span>
                </div>
              )}
              
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" className="flex-1">
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
                {order.status === 'draft' && (
                  <Button size="sm" className="flex-1">
                    <Send className="h-4 w-4 mr-2" />
                    Send Order
                  </Button>
                )}
                {['sent', 'acknowledged', 'in_transit'].includes(order.status) && (
                  <Button size="sm" variant="outline" className="flex-1">
                    <Truck className="h-4 w-4 mr-2" />
                    Track
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

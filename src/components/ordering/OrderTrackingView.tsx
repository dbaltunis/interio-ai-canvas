import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useBatchOrders } from "@/hooks/useBatchOrders";
import { useOrderTrackingHistory } from "@/hooks/useOrderTracking";
import { OrderPizzaTracker } from "./OrderPizzaTracker";
import { LeadTimePrediction } from "./LeadTimePrediction";
import { format } from "date-fns";
import { Eye, TruckIcon, Package } from "lucide-react";

const statusColors = {
  sent: "default",
  acknowledged: "default",
  in_transit: "default",
  delivered: "default",
} as const;

export const OrderTrackingView = () => {
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const { data: batchOrders, isLoading } = useBatchOrders({
    status: undefined // Get all orders
  });

  const { data: trackingHistory } = useOrderTrackingHistory(selectedOrder?.id);

  const activeOrders = batchOrders?.filter(order =>
    ['sent', 'acknowledged', 'in_transit', 'delivered'].includes(order.status)
  ) || [];

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">Loading tracking information...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-4">
        {activeOrders.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <TruckIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No active orders to track</p>
                <p className="text-sm mt-2">Orders will appear here once they are sent to suppliers</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          activeOrders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{order.batch_number}</CardTitle>
                    <CardDescription>
                      {order.vendors?.name}
                    </CardDescription>
                  </div>
                  <Badge variant={statusColors[order.status as keyof typeof statusColors] || "secondary"}>
                    {order.status.replace('_', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Items</div>
                    <div className="font-medium flex items-center gap-1">
                      <Package className="h-4 w-4" />
                      {order.total_items}
                    </div>
                  </div>
                  {order.sent_date && (
                    <div>
                      <div className="text-muted-foreground">Sent Date</div>
                      <div className="font-medium">
                        {format(new Date(order.sent_date), 'MMM dd, yyyy')}
                      </div>
                    </div>
                  )}
                  {order.expected_delivery_date && (
                    <div>
                      <div className="text-muted-foreground">Expected Delivery</div>
                      <div className="font-medium">
                        {format(new Date(order.expected_delivery_date), 'MMM dd, yyyy')}
                      </div>
                    </div>
                  )}
                  {order.tracking_number && (
                    <div className="col-span-3">
                      <div className="text-muted-foreground">Tracking Number</div>
                      <div className="font-mono text-sm">{order.tracking_number}</div>
                    </div>
                  )}
                </div>

                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setSelectedOrder(order)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Tracking Details
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Tracking Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Tracking - {selectedOrder?.batch_number}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <OrderPizzaTracker 
                batchOrder={selectedOrder} 
                trackingHistory={trackingHistory}
              />
              
              {selectedOrder.supplier_id && (
                <LeadTimePrediction
                  supplierId={selectedOrder.supplier_id}
                  materialType="material"
                  orderDate={selectedOrder.sent_date ? new Date(selectedOrder.sent_date) : undefined}
                />
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

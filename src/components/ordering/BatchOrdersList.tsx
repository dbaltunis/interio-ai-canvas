import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Send, Truck, MoreHorizontal, PackageCheck, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { SendBatchDialog } from "./SendBatchDialog";
import { ReceiveBatchDialog } from "./ReceiveBatchDialog";
import { BatchOrderDetails } from "./BatchOrderDetails";
import { useDeleteBatchOrder } from "@/hooks/useBatchOrders";

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
  const [viewOrder, setViewOrder] = useState<any>(null);
  const [sendOrder, setSendOrder] = useState<any>(null);
  const [receiveOrder, setReceiveOrder] = useState<any>(null);
  
  const deleteBatch = useDeleteBatchOrder();

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
    <>
      <div className="grid gap-4">
        {orders.map((order) => (
          <Card key={order.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{order.batch_number}</CardTitle>
                  <CardDescription>
                    {order.vendors?.name || 'Unknown Supplier'}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={statusColors[order.status as keyof typeof statusColors] || "secondary"}>
                    {statusLabels[order.status as keyof typeof statusLabels] || order.status}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setViewOrder(order)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      {order.status === 'draft' && (
                        <DropdownMenuItem onClick={() => setSendOrder(order)}>
                          <Send className="h-4 w-4 mr-2" />
                          Send to Supplier
                        </DropdownMenuItem>
                      )}
                      {['sent', 'acknowledged', 'in_transit'].includes(order.status) && (
                        <DropdownMenuItem onClick={() => setReceiveOrder(order)}>
                          <PackageCheck className="h-4 w-4 mr-2" />
                          Receive Order
                        </DropdownMenuItem>
                      )}
                      {order.status === 'draft' && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => deleteBatch.mutate(order.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Draft
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
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
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => setViewOrder(order)}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                  {order.status === 'draft' && (
                    <Button size="sm" className="flex-1" onClick={() => setSendOrder(order)}>
                      <Send className="h-4 w-4 mr-2" />
                      Send Order
                    </Button>
                  )}
                  {['sent', 'acknowledged', 'in_transit'].includes(order.status) && (
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => setReceiveOrder(order)}>
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

      {/* View Details Dialog */}
      <Dialog open={!!viewOrder} onOpenChange={(open) => !open && setViewOrder(null)}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Batch Order Details</DialogTitle>
            <DialogDescription>
              Complete information for batch order
            </DialogDescription>
          </DialogHeader>
          {viewOrder && <BatchOrderDetails batchOrder={viewOrder} />}
        </DialogContent>
      </Dialog>

      {/* Send Dialog */}
      {sendOrder && (
        <SendBatchDialog
          open={!!sendOrder}
          onOpenChange={(open) => !open && setSendOrder(null)}
          batchOrder={sendOrder}
          onSuccess={() => setSendOrder(null)}
        />
      )}

      {/* Receive Dialog */}
      {receiveOrder && (
        <ReceiveBatchDialog
          open={!!receiveOrder}
          onOpenChange={(open) => !open && setReceiveOrder(null)}
          batchOrder={receiveOrder}
          onSuccess={() => setReceiveOrder(null)}
        />
      )}
    </>
  );
};

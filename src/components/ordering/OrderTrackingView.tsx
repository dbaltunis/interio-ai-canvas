import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useBatchOrders } from "@/hooks/useBatchOrders";
import { OrderTrackingList } from "./OrderTrackingList";

export const OrderTrackingView = () => {
  const { data: batchOrders, isLoading } = useBatchOrders({
    status: undefined // Get all orders
  });

  const activeOrders = batchOrders?.filter(order =>
    ['sent', 'acknowledged', 'in_transit'].includes(order.status)
  ) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Tracking</CardTitle>
        <CardDescription>
          Track your orders from placement to delivery
        </CardDescription>
      </CardHeader>
      <CardContent>
        <OrderTrackingList
          orders={activeOrders}
          isLoading={isLoading}
        />
      </CardContent>
    </Card>
  );
};

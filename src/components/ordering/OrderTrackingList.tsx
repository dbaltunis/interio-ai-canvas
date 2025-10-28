import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, Truck } from "lucide-react";
import { format } from "date-fns";

interface OrderTrackingListProps {
  orders: any[];
  isLoading: boolean;
}

const STATUS_STAGES = [
  { id: 'sent', label: 'Ordered', icon: Circle },
  { id: 'acknowledged', label: 'Confirmed', icon: CheckCircle2 },
  { id: 'in_transit', label: 'Shipped', icon: Truck },
  { id: 'delivered', label: 'Delivered', icon: CheckCircle2 },
];

const getProgressPercentage = (status: string) => {
  const statusIndex = STATUS_STAGES.findIndex(stage => stage.id === status);
  if (statusIndex === -1) return 0;
  return ((statusIndex + 1) / STATUS_STAGES.length) * 100;
};

const getCompletedStages = (status: string) => {
  const statusIndex = STATUS_STAGES.findIndex(stage => stage.id === status);
  return statusIndex + 1;
};

export const OrderTrackingList = ({ orders, isLoading }: OrderTrackingListProps) => {
  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading orders...</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No orders in transit</p>
        <p className="text-sm mt-2">Sent orders will appear here for tracking</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {orders.map((order) => {
        const progress = getProgressPercentage(order.status);
        const completedStages = getCompletedStages(order.status);

        return (
          <Card key={order.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{order.batch_number}</CardTitle>
                  <CardDescription>
                    {order.suppliers?.name || 'Unknown Supplier'}
                  </CardDescription>
                </div>
                <Badge variant="outline">
                  {order.tracking_number || 'No tracking'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Progress Bar */}
              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Stage {completedStages} of {STATUS_STAGES.length}</span>
                  <span>{Math.round(progress)}% Complete</span>
                </div>
              </div>

              {/* Status Timeline */}
              <div className="space-y-3">
                {STATUS_STAGES.map((stage, index) => {
                  const isCompleted = index < completedStages;
                  const isCurrent = index === completedStages - 1;
                  const Icon = stage.icon;

                  return (
                    <div key={stage.id} className="flex items-center gap-3">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                        isCompleted 
                          ? 'bg-primary text-primary-foreground' 
                          : isCurrent
                          ? 'bg-primary/20 text-primary'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${
                          isCompleted || isCurrent ? 'text-foreground' : 'text-muted-foreground'
                        }`}>
                          {stage.label}
                        </p>
                        {isCompleted && order[`${stage.id}_date`] && (
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(order[`${stage.id}_date`]), 'MMM dd, HH:mm')}
                          </p>
                        )}
                      </div>
                      {isCompleted && (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Estimated Delivery */}
              {order.expected_delivery_date && (
                <div className="pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Expected Delivery:</span>
                    <span className="font-medium">
                      {format(new Date(order.expected_delivery_date), 'MMM dd, yyyy')}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

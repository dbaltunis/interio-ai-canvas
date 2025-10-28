import { CheckCircle, Circle, Clock } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface OrderPizzaTrackerProps {
  batchOrder: any;
  trackingHistory?: any[];
}

interface TrackingStage {
  id: string;
  label: string;
  status: 'ordered' | 'sent' | 'acknowledged' | 'in_transit' | 'delivered';
  date?: string;
  isCompleted: boolean;
  isCurrent: boolean;
}

export const OrderPizzaTracker = ({ batchOrder, trackingHistory }: OrderPizzaTrackerProps) => {
  const stages: TrackingStage[] = [
    {
      id: 'ordered',
      label: 'Ordered',
      status: 'ordered',
      date: batchOrder.created_at,
      isCompleted: true,
      isCurrent: batchOrder.status === 'draft',
    },
    {
      id: 'sent',
      label: 'Sent',
      status: 'sent',
      date: batchOrder.sent_date,
      isCompleted: !!batchOrder.sent_date,
      isCurrent: batchOrder.status === 'sent',
    },
    {
      id: 'acknowledged',
      label: 'Confirmed',
      status: 'acknowledged',
      date: batchOrder.acknowledged_date,
      isCompleted: !!batchOrder.acknowledged_date,
      isCurrent: batchOrder.status === 'acknowledged',
    },
    {
      id: 'in_transit',
      label: 'In Transit',
      status: 'in_transit',
      date: trackingHistory?.find(h => h.status === 'in_transit')?.created_at,
      isCompleted: ['in_transit', 'delivered', 'completed'].includes(batchOrder.status),
      isCurrent: batchOrder.status === 'in_transit',
    },
    {
      id: 'delivered',
      label: 'Delivered',
      status: 'delivered',
      date: batchOrder.actual_delivery_date,
      isCompleted: ['delivered', 'completed'].includes(batchOrder.status),
      isCurrent: batchOrder.status === 'delivered',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Visual Progress Bar */}
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-6 left-0 right-0 h-1 bg-border" />
        <div 
          className="absolute top-6 left-0 h-1 bg-primary transition-all duration-500"
          style={{ 
            width: `${(stages.filter(s => s.isCompleted).length / stages.length) * 100}%` 
          }}
        />
        
        {/* Stages */}
        <div className="relative flex justify-between">
          {stages.map((stage, index) => (
            <div key={stage.id} className="flex flex-col items-center" style={{ width: '20%' }}>
              {/* Circle */}
              <div className={cn(
                "relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-4 bg-background transition-all",
                stage.isCompleted 
                  ? "border-primary text-primary" 
                  : "border-border text-muted-foreground"
              )}>
                {stage.isCompleted ? (
                  <CheckCircle className="h-6 w-6 fill-primary text-background" />
                ) : stage.isCurrent ? (
                  <Clock className="h-6 w-6 animate-pulse" />
                ) : (
                  <Circle className="h-6 w-6" />
                )}
              </div>
              
              {/* Label */}
              <div className="mt-3 text-center">
                <div className={cn(
                  "text-sm font-medium",
                  stage.isCompleted || stage.isCurrent 
                    ? "text-foreground" 
                    : "text-muted-foreground"
                )}>
                  {stage.label}
                </div>
                {stage.date && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {format(new Date(stage.date), 'MMM dd')}
                  </div>
                )}
                {!stage.date && stage.isCurrent && (
                  <div className="text-xs text-primary mt-1">
                    Current
                  </div>
                )}
                {!stage.date && !stage.isCompleted && !stage.isCurrent && batchOrder.expected_delivery_date && index === stages.length - 1 && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Est. {format(new Date(batchOrder.expected_delivery_date), 'MMM dd')}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Status Message */}
      <div className="p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2">
          <div className={cn(
            "h-2 w-2 rounded-full animate-pulse",
            batchOrder.status === 'delivered' ? "bg-green-500" : "bg-blue-500"
          )} />
          <span className="text-sm font-medium">
            {batchOrder.status === 'draft' && 'Order is being prepared'}
            {batchOrder.status === 'sent' && 'Order sent to supplier, awaiting confirmation'}
            {batchOrder.status === 'acknowledged' && 'Order confirmed by supplier'}
            {batchOrder.status === 'in_transit' && 'Order is on the way'}
            {batchOrder.status === 'delivered' && 'Order has been delivered'}
            {batchOrder.status === 'completed' && 'Order completed'}
          </span>
        </div>
      </div>

      {/* Timeline Details */}
      {trackingHistory && trackingHistory.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Timeline</h4>
          <div className="space-y-3">
            {trackingHistory.slice().reverse().map((entry, index) => (
              <div key={entry.id} className="flex gap-3 text-sm">
                <div className="text-muted-foreground min-w-[80px]">
                  {format(new Date(entry.created_at), 'MMM dd, HH:mm')}
                </div>
                <div className="flex-1">
                  <div className="font-medium capitalize">
                    {entry.status.replace('_', ' ')}
                  </div>
                  {entry.notes && (
                    <div className="text-muted-foreground mt-1">{entry.notes}</div>
                  )}
                  {entry.location && (
                    <div className="text-muted-foreground text-xs mt-1">
                      📍 {entry.location}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

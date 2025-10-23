import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, Wrench, Calendar, User, MapPin } from "lucide-react";
import { formatCurrency } from "@/utils/currency";
import { useState } from "react";

interface WorkOrderItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  room_name?: string;
  specifications?: string[];
  materials?: string[];
  measurements?: any;
  notes?: string;
  completed?: boolean;
}

interface WorkOrderViewProps {
  workOrder: any;
  items: WorkOrderItem[];
  onUpdateStatus?: (itemId: string, completed: boolean) => void;
}

export const WorkOrderView = ({ workOrder, items, onUpdateStatus }: WorkOrderViewProps) => {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  // Group items by room
  const itemsByRoom = items.reduce((acc, item) => {
    const roomName = item.room_name || 'General';
    if (!acc[roomName]) {
      acc[roomName] = [];
    }
    acc[roomName].push(item);
    return acc;
  }, {} as Record<string, WorkOrderItem[]>);

  const handleCheckItem = (itemId: string, checked: boolean) => {
    setCheckedItems(prev => ({ ...prev, [itemId]: checked }));
    onUpdateStatus?.(itemId, checked);
  };

  const totalItems = items.length;
  const completedItems = Object.values(checkedItems).filter(Boolean).length;
  const progressPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Work Order Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Work Order #{workOrder.id?.slice(0, 8) || 'NEW'}
              </CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {workOrder.scheduled_date && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(workOrder.scheduled_date).toLocaleDateString()}
                  </div>
                )}
                {workOrder.assigned_to && (
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {workOrder.assigned_to}
                  </div>
                )}
                {workOrder.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {workOrder.location}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge>{workOrder.status || 'Pending'}</Badge>
              <Button>
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{completedItems} / {totalItems} tasks</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Work Order Items by Room */}
      {Object.entries(itemsByRoom).map(([roomName, roomItems]) => (
        <Card key={roomName}>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span>{roomName}</span>
              <Badge variant="outline">
                {roomItems.filter(i => checkedItems[i.id]).length} / {roomItems.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {roomItems.map((item, index) => (
              <div key={item.id}>
                <div className="flex gap-4 items-start">
                  <Checkbox
                    checked={checkedItems[item.id] || false}
                    onCheckedChange={(checked) => handleCheckItem(item.id, checked === true)}
                    className="mt-1"
                  />
                  <div className="flex-1 space-y-2">
                    <div className={checkedItems[item.id] ? 'line-through opacity-60' : ''}>
                      <h4 className="font-semibold">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    
                    {/* Specifications */}
                    {item.specifications && item.specifications.length > 0 && (
                      <div className="text-sm">
                        <span className="font-medium">Specifications:</span>
                        <ul className="list-disc list-inside ml-2 text-muted-foreground">
                          {item.specifications.map((spec, i) => (
                            <li key={i}>{spec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {/* Materials Required */}
                    {item.materials && item.materials.length > 0 && (
                      <div className="text-sm">
                        <span className="font-medium">Materials:</span>
                        <ul className="list-disc list-inside ml-2 text-muted-foreground">
                          {item.materials.map((material, i) => (
                            <li key={i}>{material}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {/* Measurements */}
                    {item.measurements && (
                      <div className="text-sm bg-muted/50 p-2 rounded">
                        <span className="font-medium">Measurements:</span>
                        <pre className="text-xs mt-1">
                          {JSON.stringify(item.measurements, null, 2)}
                        </pre>
                      </div>
                    )}
                    
                    {/* Notes */}
                    {item.notes && (
                      <div className="text-sm text-muted-foreground italic">
                        Note: {item.notes}
                      </div>
                    )}
                  </div>
                </div>
                {index < roomItems.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      {/* Additional Notes */}
      {workOrder.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Additional Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {workOrder.notes}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

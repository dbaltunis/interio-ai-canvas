
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Package, User, Clock, CheckCircle2 } from "lucide-react";
import { useState } from "react";

interface WorkOrder {
  id: string;
  orderNumber: string;
  treatmentType: string;
  productName: string;
  room: string;
  surface: string;
  fabricType: string;
  color: string;
  pattern: string;
  hardware: string;
  measurements: string;
  priority: string;
  status: string;
  assignedTo: string;
  dueDate: string;
  supplier: string;
  fabricCode: string;
  checkpoints: Array<{
    id: string;
    task: string;
    completed: boolean;
    assignedTo?: string;
  }>;
}

interface WorkOrdersByTreatmentProps {
  workOrders: WorkOrder[];
  onUpdateWorkOrder: (id: string, updates: Partial<WorkOrder>) => void;
  onToggleCheckpoint: (orderId: string, checkpointId: string) => void;
}

export const WorkOrdersByTreatment = ({ 
  workOrders, 
  onUpdateWorkOrder, 
  onToggleCheckpoint 
}: WorkOrdersByTreatmentProps) => {
  const [selectedTreatment, setSelectedTreatment] = useState<string>("all");

  // Group work orders by treatment type
  const groupedOrders = workOrders.reduce((acc, order) => {
    const type = order.treatmentType;
    if (!acc[type]) acc[type] = [];
    acc[type].push(order);
    return acc;
  }, {} as Record<string, WorkOrder[]>);

  const filteredOrders = selectedTreatment === "all" 
    ? workOrders 
    : groupedOrders[selectedTreatment] || [];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Filter by Treatment */}
      <div className="flex items-center space-x-4">
        <label className="text-sm font-medium">Filter by Treatment:</label>
        <Select value={selectedTreatment} onValueChange={setSelectedTreatment}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Treatments</SelectItem>
            {Object.keys(groupedOrders).map(type => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Work Orders Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredOrders.map((order) => (
          <Card key={order.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{order.orderNumber}</CardTitle>
                <div className="flex space-x-1">
                  <Badge className={getPriorityColor(order.priority)}>
                    {order.priority}
                  </Badge>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                <p className="font-medium">{order.productName}</p>
                <p>{order.room} - {order.surface}</p>
                <p>{order.measurements}</p>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Fabric & Supplier Info */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Package className="h-4 w-4 text-gray-600" />
                  <span className="font-medium text-sm">Materials</span>
                </div>
                <div className="text-sm space-y-1">
                  <p><span className="font-medium">Fabric:</span> {order.fabricType}</p>
                  <p><span className="font-medium">Color:</span> {order.color}</p>
                  <p><span className="font-medium">Code:</span> {order.fabricCode}</p>
                  <p><span className="font-medium">Supplier:</span> {order.supplier}</p>
                </div>
              </div>

              {/* Assignment */}
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-600" />
                <Select 
                  value={order.assignedTo} 
                  onValueChange={(value) => onUpdateWorkOrder(order.id, { assignedTo: value })}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Assign to..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="John Smith">John Smith</SelectItem>
                    <SelectItem value="Maria Garcia">Maria Garcia</SelectItem>
                    <SelectItem value="David Lee">David Lee</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Due Date */}
              <div className="flex items-center space-x-2 text-sm">
                <Clock className="h-4 w-4 text-gray-600" />
                <span>Due: {new Date(order.dueDate).toLocaleDateString()}</span>
              </div>

              <Separator />

              {/* Task Checkpoints */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm flex items-center">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Task Checkpoints
                </h4>
                {order.checkpoints.map((checkpoint) => (
                  <div key={checkpoint.id} className="flex items-center space-x-2">
                    <Checkbox 
                      checked={checkpoint.completed}
                      onCheckedChange={() => onToggleCheckpoint(order.id, checkpoint.id)}
                    />
                    <span className={`text-sm flex-1 ${checkpoint.completed ? 'line-through text-gray-500' : ''}`}>
                      {checkpoint.task}
                    </span>
                    {checkpoint.assignedTo && (
                      <Badge variant="outline" className="text-xs">
                        {checkpoint.assignedTo}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Progress</span>
                  <span>
                    {order.checkpoints.filter(c => c.completed).length} / {order.checkpoints.length}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ 
                      width: `${(order.checkpoints.filter(c => c.completed).length / order.checkpoints.length) * 100}%` 
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

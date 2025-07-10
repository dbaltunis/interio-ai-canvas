
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wrench, CheckCircle, Clock, AlertCircle, Users, Package } from "lucide-react";

interface ProjectWorkshopTabProps {
  project: any;
}

export const ProjectWorkshopTab = ({ project }: ProjectWorkshopTabProps) => {
  // Mock workshop data - in real app this would come from project
  const workOrders = [
    { id: 1, item: "Living Room Curtains", status: "pending", assignee: "Sarah K.", dueDate: "2024-01-15" },
    { id: 2, item: "Bedroom Blinds", status: "in_progress", assignee: "Mike R.", dueDate: "2024-01-18" },
    { id: 3, item: "Installation Service", status: "completed", assignee: "Tom L.", dueDate: "2024-01-20" }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-yellow-600" />;
      default: return <AlertCircle className="h-4 w-4 text-red-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: "bg-green-100 text-green-800",
      in_progress: "bg-yellow-100 text-yellow-800", 
      pending: "bg-red-100 text-red-800"
    };
    return variants[status] || variants.pending;
  };

  return (
    <div className="space-y-6">
      {/* Workshop Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Wrench className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Total Work Orders</p>
              <p className="text-xl font-bold">{workOrders.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Team Members</p>
              <p className="text-xl font-bold">3</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Package className="h-5 w-5 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">Materials Needed</p>
              <p className="text-xl font-bold">5</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Work Orders */}
      <Card>
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Work Orders</h3>
            <Button size="sm">
              <Wrench className="h-4 w-4 mr-2" />
              Generate Orders
            </Button>
          </div>
        </div>
        <div className="divide-y">
          {workOrders.map((order) => (
            <div key={order.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getStatusIcon(order.status)}
                <div>
                  <p className="font-medium">{order.item}</p>
                  <p className="text-sm text-gray-600">Assigned to {order.assignee}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">Due: {order.dueDate}</span>
                <Badge className={getStatusBadge(order.status)}>
                  {order.status.replace('_', ' ')}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button variant="outline" className="h-20 flex-col">
          <Users className="h-6 w-6 mb-2" />
          <span className="text-sm">Assign Tasks</span>
        </Button>
        <Button variant="outline" className="h-20 flex-col">
          <Package className="h-6 w-6 mb-2" />
          <span className="text-sm">Order Materials</span>
        </Button>
        <Button variant="outline" className="h-20 flex-col">
          <CheckCircle className="h-6 w-6 mb-2" />
          <span className="text-sm">Update Status</span>
        </Button>
        <Button variant="outline" className="h-20 flex-col">
          <Clock className="h-6 w-6 mb-2" />
          <span className="text-sm">Track Progress</span>
        </Button>
      </div>

      {/* Instructions */}
      <Card className="bg-orange-50 border-orange-200">
        <div className="p-4">
          <h4 className="font-medium text-orange-900 mb-2">Workshop Management</h4>
          <ul className="text-sm text-orange-700 space-y-1">
            <li>• Generate work orders from quote items</li>
            <li>• Assign tasks to team members and suppliers</li>
            <li>• Track progress and update status</li>
            <li>• Coordinate with installers and fitters</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

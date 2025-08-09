
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wrench, CheckCircle, Clock, AlertCircle, Users, Package, MapPin, Scissors } from "lucide-react";
import { useTreatments } from "@/hooks/useTreatments";
import { useRooms } from "@/hooks/useRooms";
import { useSurfaces } from "@/hooks/useSurfaces";
import { useProjectWindowSummaries } from "@/hooks/useProjectWindowSummaries";
import { formatCurrency } from "@/utils/currency";

interface ProjectWorkshopTabProps {
  project: any;
}

export const ProjectWorkshopTab = ({ project }: ProjectWorkshopTabProps) => {
  const { data: treatments = [] } = useTreatments(project?.id);
  const { data: rooms = [] } = useRooms(project?.id);
  const { data: surfaces = [] } = useSurfaces(project?.id);
  const { data: projectSummaries } = useProjectWindowSummaries(project?.id);
  
  // Generate work orders from treatments or fallback to window summaries
  const hasTreatments = (treatments?.length || 0) > 0;
  const workOrders = hasTreatments
    ? treatments.map(treatment => {
        const room = rooms.find(r => r.id === treatment.room_id);
        const surface = surfaces.find(s => s.id === treatment.window_id);
        
        return {
          id: treatment.id,
          window_id: treatment.window_id,
          item: `${treatment.product_name || treatment.treatment_type}`,
          location: room?.name || 'Unknown Room',
          window: surface?.name || 'Window',
          status: treatment.status || "pending",
          assignee: "Workshop Team",
          dueDate: "2024-01-20",
          treatment_type: treatment.treatment_type,
          fabric_type: treatment.fabric_type,
          color: treatment.color,
          pattern: treatment.pattern,
          hardware: treatment.hardware,
          measurements: treatment.measurements || {},
          material_cost: treatment.material_cost || 0,
          labor_cost: treatment.labor_cost || 0,
          total_cost: treatment.total_price || 0,
          fabric_details: treatment.fabric_details || {},
          notes: treatment.notes
        };
      })
    : (projectSummaries?.windows || []).map((w) => {
        const room = rooms.find(r => r.id === w.room_id);
        return {
          id: `${w.window_id}-workorder`,
          window_id: w.window_id,
          item: `${w.summary?.template_name || 'Window Treatment'}`,
          location: room?.name || 'Unknown Room',
          window: w.surface_name || 'Window',
          status: 'pending',
          assignee: 'Workshop Team',
          dueDate: new Date().toISOString().split('T')[0],
          treatment_type: w.summary?.manufacturing_type,
          fabric_type: w.summary?.fabric_details?.name,
          color: w.summary?.fabric_details?.color,
          pattern: w.summary?.fabric_details?.pattern,
          hardware: w.summary?.heading_details?.hardware,
          measurements: w.summary?.measurements_details || {},
          material_cost: Number(w.summary?.fabric_cost || 0) + Number(w.summary?.lining_cost || 0),
          labor_cost: Number(w.summary?.manufacturing_cost || 0),
          total_cost: Number(w.summary?.total_cost || 0),
          fabric_details: w.summary?.fabric_details || {},
          notes: ''
        };
      });

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
            <Package className="h-5 w-5 text-primary" />
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
          {workOrders.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No treatments created yet. Add treatments in the Jobs tab to generate work orders.
            </div>
          ) : (
            workOrders.map((order) => (
              <div key={order.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(order.status)}
                    <div>
                      <p className="font-medium">{order.item}</p>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <MapPin className="h-3 w-3 mr-1" />
                        {order.location} • {order.window}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600">Due: {order.dueDate}</span>
                    <Badge className={getStatusBadge(order.status)}>
                      {order.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
                
                {/* Manufacturing Details */}
                <div className="ml-8 pl-3 border-l-2 border-gray-100 space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Treatment:</span> {order.treatment_type}
                    </div>
                    <div>
                      <span className="text-gray-600">Fabric:</span> {order.fabric_type || 'N/A'}
                    </div>
                    {order.color && (
                      <div>
                        <span className="text-gray-600">Color:</span> {order.color}
                      </div>
                    )}
                    {order.pattern && (
                      <div>
                        <span className="text-gray-600">Pattern:</span> {order.pattern}
                      </div>
                    )}
                  </div>
                  
                  {order.measurements && Object.keys(order.measurements).length > 0 && (
                    <div className="flex items-center space-x-4 text-sm">
                      <Scissors className="h-3 w-3 text-gray-400" />
                      <span className="text-gray-600">Measurements:</span>
                      {typeof order.measurements === 'object' && order.measurements !== null && (
                        <>
                          {(order.measurements as any).rail_width && (
                            <span>W: {(order.measurements as any).rail_width}cm</span>
                          )}
                          {(order.measurements as any).drop && (
                            <span>H: {(order.measurements as any).drop}cm</span>
                          )}
                        </>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-sm pt-2">
                    <span className="text-gray-600">Assigned to {order.assignee}</span>
                    <div className="space-x-3">
                      {order.material_cost > 0 && (
                        <span className="text-gray-600">Materials: {formatCurrency(order.material_cost)}</span>
                      )}
                      {order.labor_cost > 0 && (
                        <span className="text-gray-600">Labor: {formatCurrency(order.labor_cost)}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
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

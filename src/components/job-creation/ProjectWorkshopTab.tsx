
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Wrench, Download, Edit, Save, CheckCircle } from "lucide-react";
import { useState } from "react";
import { useRooms } from "@/hooks/useRooms";
import { useSurfaces } from "@/hooks/useSurfaces";
import { useTreatments } from "@/hooks/useTreatments";
import { useClients } from "@/hooks/useClients";

interface ProjectWorkshopTabProps {
  project: any;
}

export const ProjectWorkshopTab = ({ project }: ProjectWorkshopTabProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [workOrders, setWorkOrders] = useState<any[]>([]);

  const { data: rooms } = useRooms(project.id);
  const { data: surfaces } = useSurfaces(project.id);
  const { data: treatments } = useTreatments(project.id);
  const { data: clients } = useClients();

  const client = clients?.find(c => c.id === project.client_id);
  const projectTreatments = treatments?.filter(t => t.project_id === project.id) || [];

  // Generate work orders from treatments
  const generateWorkOrders = () => {
    const orders = projectTreatments.map((treatment, index) => {
      const surface = surfaces?.find(s => s.id === treatment.window_id);
      const room = rooms?.find(r => r.id === treatment.room_id);
      
      return {
        id: treatment.id,
        orderNumber: `WO-${String(index + 1).padStart(4, '0')}`,
        treatmentType: treatment.treatment_type,
        productName: treatment.product_name,
        room: room?.name || 'Unknown Room',
        surface: surface?.name || 'Unknown Surface',
        fabricType: treatment.fabric_type,
        color: treatment.color,
        pattern: treatment.pattern,
        hardware: treatment.hardware,
        mountingType: treatment.mounting_type,
        measurements: surface ? `${surface.width || 0}" × ${surface.height || 0}"` : 'N/A',
        priority: 'Medium',
        status: 'Pending',
        assignedTo: '',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        instructions: treatment.notes || '',
        materialCost: treatment.material_cost || 0,
        laborCost: treatment.labor_cost || 0,
        totalPrice: treatment.total_price || 0
      };
    });
    setWorkOrders(orders);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">Workshop Orders</h3>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={generateWorkOrders}>
            <Wrench className="h-4 w-4 mr-2" />
            Generate Work Orders
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? <Save className="h-4 w-4 mr-2" /> : <Edit className="h-4 w-4 mr-2" />}
            {isEditing ? 'Save' : 'Edit'}
          </Button>
          <Button onClick={() => window.print()}>
            <Download className="h-4 w-4 mr-2" />
            Print All
          </Button>
        </div>
      </div>

      {/* Project Info Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Project Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p><span className="font-medium">Job #:</span> {project.job_number}</p>
              <p><span className="font-medium">Project:</span> {project.name}</p>
              <p><span className="font-medium">Status:</span> {project.status}</p>
            </div>
            <div>
              <p><span className="font-medium">Client:</span> {client?.name}</p>
              {client?.client_type === 'B2B' && <p><span className="font-medium">Company:</span> {client.company_name}</p>}
              <p><span className="font-medium">Phone:</span> {client?.phone}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Work Orders Summary */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{workOrders.filter(wo => wo.status === 'Pending').length}</p>
            <p className="text-sm text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{workOrders.filter(wo => wo.status === 'In Progress').length}</p>
            <p className="text-sm text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{workOrders.filter(wo => wo.status === 'Completed').length}</p>
            <p className="text-sm text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{workOrders.length * 4} hrs</p>
            <p className="text-sm text-muted-foreground">Est. Total Hours</p>
          </CardContent>
        </Card>
      </div>

      {/* Work Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Work Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {workOrders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Wrench className="mx-auto h-12 w-12 mb-4" />
              <p>No work orders generated yet.</p>
              <p className="text-sm">Click "Generate Work Orders" to create orders from your treatments.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Treatment</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Specifications</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.orderNumber}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.productName || order.treatmentType}</p>
                        <p className="text-sm text-gray-500">{order.measurements}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p>{order.room}</p>
                        <p className="text-sm text-gray-500">{order.surface}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {order.fabricType && <p>Fabric: {order.fabricType}</p>}
                        {order.color && <p>Color: {order.color}</p>}
                        {order.hardware && <p>Hardware: {order.hardware}</p>}
                      </div>
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Select 
                          value={order.priority} 
                          onValueChange={(value) => {
                            const updated = workOrders.map(wo => 
                              wo.id === order.id ? {...wo, priority: value} : wo
                            );
                            setWorkOrders(updated);
                          }}
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="High">High</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="Low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge className={getPriorityColor(order.priority)}>
                          {order.priority}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Select 
                          value={order.status} 
                          onValueChange={(value) => {
                            const updated = workOrders.map(wo => 
                              wo.id === order.id ? {...wo, status: value} : wo
                            );
                            setWorkOrders(updated);
                          }}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="In Progress">In Progress</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          type="date"
                          value={order.dueDate}
                          onChange={(e) => {
                            const updated = workOrders.map(wo => 
                              wo.id === order.id ? {...wo, dueDate: e.target.value} : wo
                            );
                            setWorkOrders(updated);
                          }}
                          className="w-32"
                        />
                      ) : (
                        new Date(order.dueDate).toLocaleDateString()
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={order.assignedTo}
                          onChange={(e) => {
                            const updated = workOrders.map(wo => 
                              wo.id === order.id ? {...wo, assignedTo: e.target.value} : wo
                            );
                            setWorkOrders(updated);
                          }}
                          placeholder="Assign to..."
                          className="w-32"
                        />
                      ) : (
                        order.assignedTo || 'Unassigned'
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm">
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

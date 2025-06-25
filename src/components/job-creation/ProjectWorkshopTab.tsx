
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wrench, Package, Users, ClipboardList } from "lucide-react";
import { useRooms } from "@/hooks/useRooms";
import { useSurfaces } from "@/hooks/useSurfaces";
import { useTreatments } from "@/hooks/useTreatments";
import { useClients } from "@/hooks/useClients";
import { useWorkOrders, useCreateWorkOrder, useUpdateWorkOrder } from "@/hooks/useWorkOrders";
import { useFabricOrders, useCreateFabricOrder, useUpdateFabricOrder } from "@/hooks/useFabricOrders";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { useWorkOrderCheckpoints, useUpdateWorkOrderCheckpoint } from "@/hooks/useWorkOrderCheckpoints";
import { WorkOrdersByTreatment } from "../workshop/WorkOrdersByTreatment";
import { SupplierOrderManager } from "../workshop/SupplierOrderManager";
import { TaskDelegationBoard } from "../workshop/TaskDelegationBoard";

interface ProjectWorkshopTabProps {
  project: any;
}

export const ProjectWorkshopTab = ({ project }: ProjectWorkshopTabProps) => {
  const { data: rooms } = useRooms(project.id);
  const { data: surfaces } = useSurfaces(project.id);
  const { data: treatments } = useTreatments(project.id);
  const { data: clients } = useClients();
  const { data: workOrders } = useWorkOrders(project.id);
  const { data: fabricOrders } = useFabricOrders();
  const { data: teamMembers } = useTeamMembers();

  const createWorkOrder = useCreateWorkOrder();
  const updateWorkOrder = useUpdateWorkOrder();
  const createFabricOrder = useCreateFabricOrder();
  const updateFabricOrder = useUpdateFabricOrder();
  const updateCheckpoint = useUpdateWorkOrderCheckpoint();

  const client = clients?.find(c => c.id === project.client_id);
  const projectTreatments = treatments?.filter(t => t.project_id === project.id) || [];
  const projectWorkOrders = workOrders || [];
  const projectFabricOrders = fabricOrders || [];

  const generateWorkOrders = async () => {
    if (!projectTreatments.length) return;

    for (const [index, treatment] of projectTreatments.entries()) {
      const surface = surfaces?.find(s => s.id === treatment.window_id);
      const room = rooms?.find(r => r.id === treatment.room_id);
      
      const orderNumber = `WO-${String(index + 1).padStart(4, '0')}`;
      
      try {
        await createWorkOrder.mutateAsync({
          order_number: orderNumber,
          treatment_type: treatment.treatment_type,
          project_id: project.id,
          status: 'pending',
          priority: 'medium',
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          instructions: `${treatment.product_name} for ${room?.name || 'Unknown Room'} - ${surface?.name || 'Unknown Surface'}`,
          notes: treatment.notes,
          estimated_hours: 8
        });
      } catch (error) {
        console.error('Error creating work order:', error);
      }
    }

    // Generate fabric orders
    const fabricOrdersMap = new Map();
    
    projectTreatments.forEach(treatment => {
      if (!treatment.fabric_type) return;
      
      const key = `${treatment.fabric_type}-${treatment.color}`;
      if (!fabricOrdersMap.has(key)) {
        const supplier = getSupplierForFabric(treatment.fabric_type);
        fabricOrdersMap.set(key, {
          fabric_code: `FB-${treatment.fabric_type?.slice(0, 3).toUpperCase()}-${treatment.color?.slice(0, 3).toUpperCase()}`,
          fabric_type: treatment.fabric_type,
          color: treatment.color,
          pattern: treatment.pattern,
          supplier: supplier,
          quantity: 0,
          unit: 'yards',
          unit_price: 25.50,
          total_price: 0,
          work_order_ids: []
        });
      }
      
      const fabricOrder = fabricOrdersMap.get(key);
      fabricOrder.quantity += 5; // Estimated 5 yards per treatment
      fabricOrder.total_price = fabricOrder.quantity * fabricOrder.unit_price;
      fabricOrder.work_order_ids.push(treatment.id);
    });
    
    for (const fabricOrder of fabricOrdersMap.values()) {
      try {
        await createFabricOrder.mutateAsync(fabricOrder);
      } catch (error) {
        console.error('Error creating fabric order:', error);
      }
    }
  };

  const getSupplierForFabric = (fabricType: string) => {
    const suppliers = {
      'Velvet': 'Premium Fabrics Ltd',
      'Cotton': 'Cotton Mill Co',
      'Linen': 'Natural Textiles Inc',
      'Silk': 'Silk Importers Ltd',
      'Polyester': 'Synthetic Solutions'
    };
    return suppliers[fabricType as keyof typeof suppliers] || 'General Suppliers';
  };

  const handleUpdateWorkOrder = async (id: string, updates: any) => {
    try {
      await updateWorkOrder.mutateAsync({ id, ...updates });
    } catch (error) {
      console.error('Error updating work order:', error);
    }
  };

  const handleToggleCheckpoint = async (orderId: string, checkpointId: string) => {
    try {
      // Get current checkpoint status
      const currentCheckpoints = await supabase
        .from('work_order_checkpoints')
        .select('completed')
        .eq('id', checkpointId)
        .single();

      if (currentCheckpoints.data) {
        await updateCheckpoint.mutateAsync({ 
          id: checkpointId, 
          completed: !currentCheckpoints.data.completed,
          completed_at: !currentCheckpoints.data.completed ? new Date().toISOString() : null
        });
      }
    } catch (error) {
      console.error('Error toggling checkpoint:', error);
    }
  };

  const handleUpdateFabricOrder = async (id: string, updates: any) => {
    try {
      await updateFabricOrder.mutateAsync({ id, ...updates });
    } catch (error) {
      console.error('Error updating fabric order:', error);
    }
  };

  const handleBulkOrder = async (supplierName: string, orders: any[]) => {
    console.log(`Sending bulk order to ${supplierName}:`, orders);
    
    for (const order of orders) {
      try {
        await updateFabricOrder.mutateAsync({ 
          id: order.id, 
          status: 'ordered', 
          order_date: new Date().toISOString().split('T')[0]
        });
      } catch (error) {
        console.error('Error updating fabric order:', error);
      }
    }
  };

  const handleReassignTask = (taskId: string, newAssignee: string) => {
    console.log(`Reassigning task ${taskId} to ${newAssignee}`);
  };

  const handleUpdateTaskStatus = (taskId: string, status: string) => {
    console.log(`Updating task ${taskId} status to ${status}`);
  };

  // Transform data for components
  const transformedWorkOrders = projectWorkOrders.map(wo => ({
    id: wo.id,
    orderNumber: wo.order_number,
    treatmentType: wo.treatment_type,
    productName: wo.treatment_type,
    room: 'Project Room',
    surface: 'Surface',
    fabricType: 'Cotton',
    color: 'Natural',
    pattern: '',
    hardware: '',
    measurements: '120" × 84"',
    priority: wo.priority,
    status: wo.status,
    assignedTo: wo.assigned_to || '',
    dueDate: wo.due_date || new Date().toISOString().split('T')[0],
    supplier: 'General Suppliers',
    fabricCode: 'FB-COT-NAT',
    checkpoints: [
      { id: '1', task: 'Prepare materials', completed: false },
      { id: '2', task: 'Assembly', completed: false },
      { id: '3', task: 'Quality check', completed: false }
    ]
  }));

  const mockTaskAssignments = [
    {
      id: "1",
      workOrderId: "WO-001",
      treatmentType: "Velvet Curtains",
      projectName: project.name,
      assignedTo: "John Smith",
      estimatedHours: 8,
      actualHours: 6,
      status: "in-progress" as const,
      priority: "high" as const,
      dueDate: "2025-01-15",
      skills_required: ["Curtains", "Hand-sewing"],
      notes: "Client prefers French seams"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold">Workshop Management</h3>
          <p className="text-muted-foreground">
            Organize treatments, manage suppliers, and delegate tasks for {project.name}
          </p>
        </div>
        <Button onClick={generateWorkOrders} disabled={createWorkOrder.isPending}>
          <Wrench className="h-4 w-4 mr-2" />
          {createWorkOrder.isPending ? 'Generating...' : 'Generate Work Orders'}
        </Button>
      </div>

      {/* Project Info */}
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

      {/* Tabs for different workshop views */}
      <Tabs defaultValue="work-orders" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="work-orders" className="flex items-center space-x-2">
            <ClipboardList className="h-4 w-4" />
            <span>Work Orders</span>
          </TabsTrigger>
          <TabsTrigger value="suppliers" className="flex items-center space-x-2">
            <Package className="h-4 w-4" />
            <span>Suppliers</span>
          </TabsTrigger>
          <TabsTrigger value="delegation" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Team</span>
          </TabsTrigger>
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <Wrench className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="work-orders">
          <WorkOrdersByTreatment 
            workOrders={transformedWorkOrders}
            onUpdateWorkOrder={handleUpdateWorkOrder}
            onToggleCheckpoint={handleToggleCheckpoint}
          />
        </TabsContent>

        <TabsContent value="suppliers">
          <SupplierOrderManager 
            fabricOrders={projectFabricOrders}
            onUpdateOrder={handleUpdateFabricOrder}
            onBulkOrder={handleBulkOrder}
          />
        </TabsContent>

        <TabsContent value="delegation">
          <TaskDelegationBoard 
            teamMembers={teamMembers || []}
            taskAssignments={mockTaskAssignments}
            onReassignTask={handleReassignTask}
            onUpdateTaskStatus={handleUpdateTaskStatus}
          />
        </TabsContent>

        <TabsContent value="overview">
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Production Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Total Work Orders:</span>
                    <span className="font-medium">{projectWorkOrders.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Completed:</span>
                    <span className="font-medium text-green-600">{projectWorkOrders.filter(w => w.status === 'completed').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>In Progress:</span>
                    <span className="font-medium text-blue-600">{projectWorkOrders.filter(w => w.status === 'in_progress').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pending:</span>
                    <span className="font-medium text-yellow-600">{projectWorkOrders.filter(w => w.status === 'pending').length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Material Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Items Needed:</span>
                    <span className="font-medium">{projectFabricOrders.filter(f => f.status === 'needed').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Orders Placed:</span>
                    <span className="font-medium text-blue-600">{projectFabricOrders.filter(f => f.status === 'ordered').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Received:</span>
                    <span className="font-medium text-green-600">{projectFabricOrders.filter(f => f.status === 'received').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Value:</span>
                    <span className="font-medium">${projectFabricOrders.reduce((sum, f) => sum + (f.total_price || 0), 0).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Team Utilization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {teamMembers?.map(member => (
                    <div key={member.id} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{member.name}</span>
                        <span>Available</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full w-1/3" />
                      </div>
                    </div>
                  )) || (
                    <p className="text-sm text-muted-foreground">No team members added yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wrench, Package, Users, ClipboardList } from "lucide-react";
import { useState } from "react";
import { useRooms } from "@/hooks/useRooms";
import { useSurfaces } from "@/hooks/useSurfaces";
import { useTreatments } from "@/hooks/useTreatments";
import { useClients } from "@/hooks/useClients";
import { WorkOrdersByTreatment } from "../workshop/WorkOrdersByTreatment";
import { SupplierOrderManager } from "../workshop/SupplierOrderManager";
import { TaskDelegationBoard } from "../workshop/TaskDelegationBoard";

interface ProjectWorkshopTabProps {
  project: any;
}

export const ProjectWorkshopTab = ({ project }: ProjectWorkshopTabProps) => {
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [fabricOrders, setFabricOrders] = useState<any[]>([]);

  const { data: rooms } = useRooms(project.id);
  const { data: surfaces } = useSurfaces(project.id);
  const { data: treatments } = useTreatments(project.id);
  const { data: clients } = useClients();

  const client = clients?.find(c => c.id === project.client_id);
  const projectTreatments = treatments?.filter(t => t.project_id === project.id) || [];

  // Mock team members data
  const teamMembers = [
    {
      id: "1",
      name: "John Smith",
      role: "Senior Curtain Maker",
      expertise: ["Curtains", "Valances", "Swags", "Hand-sewing"],
      currentWorkload: 32,
      maxCapacity: 40,
      status: "available" as const
    },
    {
      id: "2", 
      name: "Maria Garcia",
      role: "Blind Specialist",
      expertise: ["Vertical Blinds", "Horizontal Blinds", "Motorized Systems"],
      currentWorkload: 38,
      maxCapacity: 40,
      status: "busy" as const
    },
    {
      id: "3",
      name: "David Lee", 
      role: "Hardware Expert",
      expertise: ["Installation", "Motorized Blinds", "Rails", "Hardware"],
      currentWorkload: 20,
      maxCapacity: 35,
      status: "available" as const
    }
  ];

  // Mock task assignments
  const taskAssignments = [
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

  // Generate comprehensive work orders from treatments
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
        totalPrice: treatment.total_price || 0,
        supplier: getSupplierForFabric(treatment.fabric_type),
        fabricCode: `FB-${treatment.fabric_type?.slice(0, 3).toUpperCase()}-${treatment.color?.slice(0, 3).toUpperCase()}`,
        checkpoints: generateCheckpoints(treatment.treatment_type)
      };
    });
    setWorkOrders(orders);
    generateFabricOrders(orders);
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

  const generateCheckpoints = (treatmentType: string) => {
    const checkpointTemplates = {
      'Curtains': [
        { id: '1', task: 'Measure and cut fabric', completed: false },
        { id: '2', task: 'Sew side hems', completed: false },
        { id: '3', task: 'Create heading', completed: false },
        { id: '4', task: 'Attach lining', completed: false },
        { id: '5', task: 'Quality check', completed: false },
        { id: '6', task: 'Steam and press', completed: false }
      ],
      'Blinds': [
        { id: '1', task: 'Cut slats to size', completed: false },
        { id: '2', task: 'Install control mechanism', completed: false },
        { id: '3', task: 'Thread lift cords', completed: false },
        { id: '4', task: 'Attach ladder tapes', completed: false },
        { id: '5', task: 'Test operation', completed: false }
      ]
    };
    return checkpointTemplates[treatmentType as keyof typeof checkpointTemplates] || [
      { id: '1', task: 'Prepare materials', completed: false },
      { id: '2', task: 'Assembly', completed: false },
      { id: '3', task: 'Quality check', completed: false }
    ];
  };

  const generateFabricOrders = (orders: any[]) => {
    const fabricOrdersMap = new Map();
    
    orders.forEach(order => {
      const key = `${order.fabricType}-${order.color}-${order.supplier}`;
      if (!fabricOrdersMap.has(key)) {
        fabricOrdersMap.set(key, {
          id: `fab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          fabricCode: order.fabricCode,
          fabricType: order.fabricType,
          color: order.color,
          pattern: order.pattern,
          supplier: order.supplier,
          quantity: 0,
          unit: 'yards',
          unitPrice: 25.50,
          totalPrice: 0,
          workOrderIds: [],
          status: 'needed' as const
        });
      }
      
      const fabricOrder = fabricOrdersMap.get(key);
      fabricOrder.quantity += 5; // Estimated 5 yards per treatment
      fabricOrder.totalPrice = fabricOrder.quantity * fabricOrder.unitPrice;
      fabricOrder.workOrderIds.push(order.id);
    });
    
    setFabricOrders(Array.from(fabricOrdersMap.values()));
  };

  const handleUpdateWorkOrder = (id: string, updates: any) => {
    setWorkOrders(prev => prev.map(order => 
      order.id === id ? { ...order, ...updates } : order
    ));
  };

  const handleToggleCheckpoint = (orderId: string, checkpointId: string) => {
    setWorkOrders(prev => prev.map(order => 
      order.id === orderId ? {
        ...order,
        checkpoints: order.checkpoints.map((checkpoint: any) =>
          checkpoint.id === checkpointId 
            ? { ...checkpoint, completed: !checkpoint.completed }
            : checkpoint
        )
      } : order
    ));
  };

  const handleUpdateFabricOrder = (id: string, updates: any) => {
    setFabricOrders(prev => prev.map(order => 
      order.id === id ? { ...order, ...updates } : order
    ));
  };

  const handleBulkOrder = (supplierName: string, orders: any[]) => {
    console.log(`Sending bulk order to ${supplierName}:`, orders);
    // Here you would integrate with your supplier ordering system
    setFabricOrders(prev => prev.map(order => 
      orders.some(o => o.id === order.id) 
        ? { ...order, status: 'ordered', orderDate: new Date().toISOString() }
        : order
    ));
  };

  const handleReassignTask = (taskId: string, newAssignee: string) => {
    console.log(`Reassigning task ${taskId} to ${newAssignee}`);
  };

  const handleUpdateTaskStatus = (taskId: string, status: string) => {
    console.log(`Updating task ${taskId} status to ${status}`);
  };

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
        <Button onClick={generateWorkOrders}>
          <Wrench className="h-4 w-4 mr-2" />
          Generate Work Orders
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
            workOrders={workOrders}
            onUpdateWorkOrder={handleUpdateWorkOrder}
            onToggleCheckpoint={handleToggleCheckpoint}
          />
        </TabsContent>

        <TabsContent value="suppliers">
          <SupplierOrderManager 
            fabricOrders={fabricOrders}
            onUpdateOrder={handleUpdateFabricOrder}
            onBulkOrder={handleBulkOrder}
          />
        </TabsContent>

        <TabsContent value="delegation">
          <TaskDelegationBoard 
            teamMembers={teamMembers}
            taskAssignments={taskAssignments}
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
                    <span className="font-medium">{workOrders.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Completed:</span>
                    <span className="font-medium text-green-600">{workOrders.filter(w => w.status === 'Completed').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>In Progress:</span>
                    <span className="font-medium text-blue-600">{workOrders.filter(w => w.status === 'In Progress').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pending:</span>
                    <span className="font-medium text-yellow-600">{workOrders.filter(w => w.status === 'Pending').length}</span>
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
                    <span className="font-medium">{fabricOrders.filter(f => f.status === 'needed').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Orders Placed:</span>
                    <span className="font-medium text-blue-600">{fabricOrders.filter(f => f.status === 'ordered').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Received:</span>
                    <span className="font-medium text-green-600">{fabricOrders.filter(f => f.status === 'received').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Value:</span>
                    <span className="font-medium">${fabricOrders.reduce((sum, f) => sum + f.totalPrice, 0).toFixed(2)}</span>
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
                  {teamMembers.map(member => (
                    <div key={member.id} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{member.name}</span>
                        <span>{Math.round((member.currentWorkload / member.maxCapacity) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(member.currentWorkload / member.maxCapacity) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

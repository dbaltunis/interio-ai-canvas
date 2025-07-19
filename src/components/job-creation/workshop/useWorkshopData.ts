
import { useRooms } from "@/hooks/useRooms";
import { useSurfaces } from "@/hooks/useSurfaces";
import { useTreatments } from "@/hooks/useTreatments";
import { useClients } from "@/hooks/useClients";
import { useWorkOrders } from "@/hooks/useWorkOrders";
import { useFabricOrders } from "@/hooks/useFabricOrders";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import type { TransformedFabricOrder, TransformedTeamMember, TransformedWorkOrder, TaskAssignment } from "./types";

export const useWorkshopData = (project: any) => {
  const actualProjectId = project.project_id || project.id;
  
  const { data: rooms } = useRooms(actualProjectId);
  const { data: surfaces } = useSurfaces(actualProjectId);
  const { data: treatments } = useTreatments(actualProjectId);
  const { data: clients } = useClients();
  const { data: workOrders } = useWorkOrders(actualProjectId);
  const { data: fabricOrders } = useFabricOrders();
  const { data: teamMembers } = useTeamMembers();

  const client = clients?.find(c => c.id === (project.client_id || project.client_id));
  const projectTreatments = treatments?.filter(t => t.project_id === actualProjectId) || [];
  const projectWorkOrders = workOrders || [];
  
  // Transform fabric orders to match expected interface
  const transformedFabricOrders: TransformedFabricOrder[] = fabricOrders?.map(order => ({
    id: order.id,
    fabricCode: order.fabric_code,
    fabricType: order.fabric_type,
    color: order.color,
    pattern: order.pattern,
    supplier: order.supplier,
    quantity: order.quantity,
    unit: order.unit,
    unitPrice: order.unit_price,
    totalPrice: order.total_price,
    status: order.status as "ordered" | "needed" | "received",
    orderDate: order.order_date,
    expectedDelivery: order.expected_delivery || null,
    receivedDate: order.received_date || null,
    workOrderIds: order.work_order_ids || [],
    notes: order.notes || ''
  })) || [];

  // Transform team members to match expected interface
  const transformedTeamMembers: TransformedTeamMember[] = teamMembers?.map(member => ({
    id: member.id,
    name: member.name,
    role: member.role,
    expertise: member.skills || [],
    email: member.email,
    phone: member.phone,
    currentWorkload: 0,
    maxCapacity: 40,
    status: member.active ? 'available' as const : 'offline' as const,
    hourlyRate: member.hourly_rate,
    active: member.active
  })) || [];

  // Transform data for components
  const transformedWorkOrders: TransformedWorkOrder[] = projectWorkOrders.map(wo => ({
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

  const mockTaskAssignments: TaskAssignment[] = [
    {
      id: "1",
      workOrderId: "WO-001",
      treatmentType: "Velvet Curtains",
      projectName: project.name || "Project",
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

  return {
    actualProjectId,
    client,
    projectTreatments,
    projectWorkOrders,
    transformedFabricOrders,
    transformedTeamMembers,
    transformedWorkOrders,
    mockTaskAssignments,
    rooms,
    surfaces
  };
};


export interface TransformedFabricOrder {
  id: string;
  fabricCode: string;
  fabricType: string;
  color: string | null;
  pattern: string | null;
  supplier: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  status: "ordered" | "needed" | "received";
  orderDate: string | null;
  expectedDelivery: string | null;
  receivedDate: string | null;
  workOrderIds: string[];
  notes: string | null;
}

export interface TransformedTeamMember {
  id: string;
  name: string;
  role: string;
  expertise: string[];
  email: string | null;
  phone: string | null;
  currentWorkload: number;
  maxCapacity: number;
  status: "available" | "busy" | "offline";
  hourlyRate: number | null;
  active: boolean;
}

export interface TransformedWorkOrder {
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
  }>;
}

export interface TaskAssignment {
  id: string;
  workOrderId: string;
  treatmentType: string;
  projectName: string;
  assignedTo: string;
  estimatedHours: number;
  actualHours: number;
  status: "in-progress" | "completed" | "pending";
  priority: "high" | "medium" | "low";
  dueDate: string;
  skills_required: string[];
  notes: string;
}

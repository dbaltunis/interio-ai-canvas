export interface WorkOrderItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  room_name?: string;
  treatment_type?: string;
  specifications?: string[];
  materials?: string[];
  measurements?: any;
  notes?: string;
  completed?: boolean;
  image_url?: string;
  assignee?: string;
  due_date?: string;
}

export interface WorkOrderData {
  header: {
    orderNumber: string;
    clientName: string;
    projectName: string;
    createdDate: string;
    dueDate: string;
    assignedTo?: string;
    status?: string;
  };
  items: WorkOrderItem[];
  rooms: string[];
  treatmentTypes: string[];
  settings: {
    orientation: 'portrait' | 'landscape';
    margins: { top: number; right: number; bottom: number; left: number };
    imageSize: number;
    imagePosition: 'above' | 'center' | 'left';
    showRoomNames: boolean;
    showMaterials: boolean;
    showMeasurements: boolean;
    showCheckpoints: boolean;
  };
}

export const buildWorkOrderData = (
  project: any,
  treatments: any[],
  rooms: any[],
  templateSettings: any
): WorkOrderData => {
  // Convert treatments to work order items
  const items: WorkOrderItem[] = treatments.map((treatment) => ({
    id: treatment.id,
    name: treatment.name || treatment.treatment_type,
    description: treatment.description || '',
    quantity: treatment.quantity || 1,
    room_name: treatment.room_name,
    treatment_type: treatment.treatment_type,
    specifications: treatment.specifications || [],
    materials: treatment.materials || [],
    measurements: treatment.measurements,
    notes: treatment.notes,
    completed: treatment.completed || false,
    image_url: treatment.image_url,
    assignee: treatment.assignee,
    due_date: treatment.due_date,
  }));

  // Extract unique rooms and treatment types
  const uniqueRooms = [...new Set(items.map(item => item.room_name).filter(Boolean))] as string[];
  const uniqueTreatmentTypes = [...new Set(items.map(item => item.treatment_type).filter(Boolean))] as string[];

  return {
    header: {
      orderNumber: project?.job_number || 'WO-001',
      clientName: project?.client?.name || '',
      projectName: project?.name || '',
      createdDate: project?.created_at ? new Date(project.created_at).toLocaleDateString() : new Date().toLocaleDateString(),
      dueDate: project?.due_date ? new Date(project.due_date).toLocaleDateString() : '',
      assignedTo: project?.assigned_to || '',
      status: project?.status || 'pending',
    },
    items,
    rooms: uniqueRooms,
    treatmentTypes: uniqueTreatmentTypes,
    settings: templateSettings || {
      orientation: 'portrait',
      margins: { top: 8, right: 8, bottom: 6, left: 8 },
      imageSize: 80,
      imagePosition: 'above',
      showRoomNames: true,
      showMaterials: true,
      showMeasurements: true,
      showCheckpoints: true,
    },
  };
};

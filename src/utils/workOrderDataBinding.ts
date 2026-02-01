import { format } from 'date-fns';

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

// Helper to convert user format to date-fns format
const convertToDateFnsFormat = (userFormat: string): string => {
  const formatMap: Record<string, string> = {
    'MM/dd/yyyy': 'MM/dd/yyyy',
    'dd/MM/yyyy': 'dd/MM/yyyy', 
    'yyyy-MM-dd': 'yyyy-MM-dd',
    'dd-MMM-yyyy': 'dd-MMM-yyyy',
  };
  return formatMap[userFormat] || 'MM/dd/yyyy';
};

export const buildWorkOrderData = (
  project: any,
  treatments: any[],
  rooms: any[],
  templateSettings: any,
  userDateFormat: string = 'MM/dd/yyyy'
): WorkOrderData => {
  // Helper to format dates using user's preference
  const formatDate = (dateStr: string | null | undefined): string => {
    if (!dateStr) return '';
    try {
      return format(new Date(dateStr), convertToDateFnsFormat(userDateFormat));
    } catch {
      return '';
    }
  };

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
      createdDate: formatDate(project?.created_at) || format(new Date(), convertToDateFnsFormat(userDateFormat)),
      dueDate: formatDate(project?.due_date),
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


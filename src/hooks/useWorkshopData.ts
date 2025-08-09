import { useMemo } from "react";
import { useProjectWindowSummaries } from "@/hooks/useProjectWindowSummaries";

export interface WorkshopRoomItem {
  id: string;
  name: string;
  roomName?: string;
  location?: string;
  quantity?: number;
  measurements?: {
    width?: number;
    height?: number;
    unit?: string;
  };
  treatmentType?: string;
  notes?: string;
}

export interface WorkshopRoomSection {
  roomName: string;
  items: WorkshopRoomItem[];
  totals?: {
    count: number;
  };
}

export interface WorkshopHeaderMeta {
  orderNumber?: string;
  clientName?: string;
  projectName?: string;
  createdDate?: string;
  dueDate?: string;
  assignedMaker?: string;
  shippingAddress?: string;
}

export interface WorkshopData {
  header: WorkshopHeaderMeta;
  rooms: WorkshopRoomSection[];
  projectTotals?: {
    itemsCount: number;
  };
}

export const useWorkshopData = (projectId?: string) => {
  const { data, isLoading, error } = useProjectWindowSummaries(projectId);

  const workshopData: WorkshopData | undefined = useMemo(() => {
    if (!data) return undefined;

    const roomsMap = new Map<string, WorkshopRoomSection>();

    // Gather window summaries in a defensive way since the exact field can vary
    const rawSummaries: any[] = (data as any)?.windowSummaries ?? (data as any)?.windows ?? [];
    const items = rawSummaries.map((w: any) => {
      const item: WorkshopRoomItem = {
        id: w.window_id || w.id || Math.random().toString(36).slice(2),
        name: w.window_name || w.name || "Window",
        roomName: w.room_name || w.room || "Room",
        location: w.location || undefined,
        quantity: w.quantity || 1,
        measurements: {
          width: w.width_cm || w.width || undefined,
          height: w.height_cm || w.height || undefined,
          unit: w.width_cm || w.height_cm ? "cm" : undefined,
        },
        treatmentType: w.treatment_type || w.template_name || undefined,
        notes: w.notes || undefined,
      };
      return item;
    });

    items.forEach((item) => {
      const key = item.roomName || "Room";
      if (!roomsMap.has(key)) {
        roomsMap.set(key, { roomName: key, items: [], totals: { count: 0 } });
      }
      const entry = roomsMap.get(key)!;
      entry.items.push(item);
      entry.totals = { count: (entry.totals?.count || 0) + 1 };
    });

    const rooms = Array.from(roomsMap.values()).sort((a, b) =>
      a.roomName.localeCompare(b.roomName)
    );

    return {
      header: {
        orderNumber: undefined,
        clientName: undefined,
        projectName: undefined,
        createdDate: new Date().toISOString().slice(0, 10),
        dueDate: undefined,
        assignedMaker: undefined,
        shippingAddress: undefined,
      },
      rooms,
      projectTotals: { itemsCount: items.length },
    } as WorkshopData;
  }, [data]);

  return {
    data: workshopData,
    isLoading,
    error,
  } as const;
};

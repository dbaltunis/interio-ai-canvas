import { useMemo } from "react";
import { useProject } from "@/hooks/useProjects";
import { useRooms } from "@/hooks/useRooms";
import { useSurfaces } from "@/hooks/useSurfaces";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
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
  summary?: any;
  surface?: any;
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
  const { data: project, isLoading: loadingProject, error: errorProject } = useProject(projectId || "");
  const { data: rooms = [], isLoading: loadingRooms, error: errorRooms } = useRooms(projectId);
  const { data: surfaces = [], isLoading: loadingSurfaces, error: errorSurfaces } = useSurfaces(projectId);
  const { data: projectSummaries, isLoading: loadingSummaries, error: errorSummaries } = useProjectWindowSummaries(projectId);
  const { convertToUserUnit, getLengthUnitLabel } = useMeasurementUnits();

  const workshopData: WorkshopData | undefined = useMemo(() => {
    // Build sections from rooms and surfaces
    const roomsMap = new Map<string, WorkshopRoomSection>();

    // Build summary map for quick lookup by window_id
    const summaryMap = new Map<string, any>(
      ((projectSummaries?.windows || []) as any[]).map((w: any) => [w.window_id, w.summary])
    );

    // Seed sections from existing rooms
    (rooms || []).forEach((r: any) => {
      roomsMap.set(r.id, { roomName: r.name || "Room", items: [], totals: { count: 0 } });
    });

    const getRoomName = (roomId?: string) => {
      const r = (rooms || []).find((x: any) => x.id === roomId);
      return r?.name || (roomId ? `Room ${roomId.slice(0, 4)}` : "Unassigned");
    };

    const ensureSectionByRoomId = (roomId?: string) => {
      const key = roomId || "unassigned";
      if (!roomsMap.has(key)) {
        roomsMap.set(key, { roomName: getRoomName(roomId), items: [], totals: { count: 0 } });
      }
      return roomsMap.get(key)!;
    };

    (surfaces || []).forEach((s: any) => {
      const widthIn = typeof s.width === "number" ? s.width : undefined;
      const heightIn = typeof s.height === "number" ? s.height : undefined;
      const width = widthIn !== undefined ? Math.round(convertToUserUnit(widthIn, "inches") * 100) / 100 : undefined;
      const height = heightIn !== undefined ? Math.round(convertToUserUnit(heightIn, "inches") * 100) / 100 : undefined;

      const item: WorkshopRoomItem = {
        id: s.id,
        name: s.name || "Window",
        roomName: getRoomName(s.room_id),
        location: undefined,
        quantity: 1,
        measurements: {
          width,
          height,
          unit: (width || height) ? getLengthUnitLabel() : undefined,
        },
        treatmentType: s.surface_type || s.type || undefined,
        notes: s.notes || undefined,
        summary: summaryMap.get(s.id),
        surface: s,
      };

      const section = ensureSectionByRoomId(s.room_id);
      section.items.push(item);
      section.totals = { count: (section.totals?.count || 0) + 1 };
    });

    const sections = Array.from(roomsMap.entries())
      .map(([key, section]) => ({ key, ...section }))
      .sort((a, b) => a.roomName.localeCompare(b.roomName))
      .map(({ key, ...rest }) => rest);

    if (sections.length === 0) return undefined;

    return {
      header: {
        orderNumber: (project as any)?.job_number ?? undefined,
        clientName: undefined,
        projectName: (project as any)?.name ?? undefined,
        createdDate: (project as any)?.created_at ? String((project as any).created_at).slice(0, 10) : new Date().toISOString().slice(0, 10),
        dueDate: (project as any)?.due_date ?? undefined,
        assignedMaker: undefined,
        shippingAddress: undefined,
      },
      rooms: sections,
      projectTotals: { itemsCount: (surfaces || []).length },
    } as WorkshopData;
  }, [project, rooms, surfaces, projectSummaries, convertToUserUnit, getLengthUnitLabel]);

  return {
    data: workshopData,
    isLoading: loadingProject || loadingRooms || loadingSurfaces || loadingSummaries,
    error: errorProject || errorRooms || errorSurfaces || errorSummaries,
  } as const;
};

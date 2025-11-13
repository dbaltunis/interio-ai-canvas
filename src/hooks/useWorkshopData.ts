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
    drop?: number;
    pooling?: number;
    unit?: string;
  };
  treatmentType?: string;
  notes?: string;
  summary?: any;
  surface?: any;
  
  // Manufacturing details
  fabricDetails?: {
    name: string;
    fabricWidth: number;
    imageUrl?: string;
    pricePerUnit?: number;
    rollDirection?: string;
    patternRepeat?: number;
  };
  
  fabricUsage?: {
    linearMeters: number;
    linearYards: number;
    widthsRequired: number;
    seamsRequired: number;
    leftover?: number;
  };
  
  hems?: {
    header: number;
    bottom: number;
    side: number;
    seam?: number;
  };
  
  fullness?: {
    ratio: number;
    headingType: string;
  };
  
  options?: Array<{
    name: string;
    optionKey: string;
    price: number;
    quantity?: number;
  }>;
  
  liningDetails?: {
    type: string;
    name?: string;
  };
  
  visualDetails?: {
    thumbnailUrl?: string;
    showImage: boolean;
  };
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
    // Debug logging for data flow
    console.log('🏭 [WORKROOM] Building workshop data:', {
      projectId,
      hasProject: !!project,
      roomsCount: rooms?.length || 0,
      surfacesCount: surfaces?.length || 0,
      summariesCount: projectSummaries?.windows?.length || 0,
      projectName: (project as any)?.name,
    });

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

      const summary = summaryMap.get(s.id);
      
      console.log(`🔍 Workshop Item for ${s.name}:`, {
        surfaceId: s.id,
        hasSummary: !!summary,
        summaryTreatmentType: summary?.treatment_type,
        summaryTemplateName: summary?.template_name,
        surfaceType: s.surface_type,
        finalTreatmentType: summary?.template_name || summary?.treatment_type || s.surface_type || undefined
      });
      
      // Extract manufacturing details from summary
      const fabricDetails = summary?.fabric_details ? {
        name: summary.fabric_details.name || 'Unknown Fabric',
        fabricWidth: summary.fabric_details.fabric_width || 137,
        imageUrl: summary.fabric_details.image_url,
        pricePerUnit: summary.fabric_details.selling_price,
        rollDirection: summary.measurements_details?.fabric_rotated ? 'Horizontal' : 'Vertical',
        patternRepeat: summary.fabric_details.pattern_repeat,
      } : undefined;
      
      const linearMeters = summary?.linear_meters || 0;
      const widthsRequired = summary?.widths_required || 1;
      const fabricUsage = {
        linearMeters,
        linearYards: linearMeters * 1.09361,
        widthsRequired,
        seamsRequired: Math.max(0, widthsRequired - 1),
        leftover: summary?.measurements_details?.leftover || 0,
      };
      
      const hems = {
        header: summary?.measurements_details?.header_hem || summary?.template_details?.header_allowance || 15,
        bottom: summary?.measurements_details?.bottom_hem || summary?.template_details?.bottom_hem || 10,
        side: summary?.measurements_details?.side_hem || summary?.template_details?.side_hems || 5,
        seam: summary?.measurements_details?.seam_hem || summary?.template_details?.seam_hems || 3,
      };
      
      const fullness = {
        ratio: summary?.measurements_details?.fullness_ratio || 
               summary?.measurements_details?.heading_fullness || 
               summary?.heading_details?.fullness_ratio ||
               summary?.template_details?.fullness_ratio || 2.5,
        headingType: summary?.heading_details?.heading_name || summary?.template_details?.heading_type || 'Standard',
        extraFabric: summary?.heading_details?.extra_fabric || 0,
        hardware: summary?.heading_details?.hardware || undefined,
      };
      
      const options = (summary?.selected_options || []).map((opt: any) => ({
        name: opt.name || opt.option_name || 'Option',
        optionKey: opt.optionKey || opt.option_key || '',
        price: opt.price || 0,
        quantity: opt.quantity || 1,
      }));
      
      console.log(`🔍 Treatment Options for ${s.name}:`, {
        surfaceId: s.id,
        selectedOptions: summary?.selected_options,
        mappedOptions: options,
        optionsCount: options.length
      });
      
      const liningDetails = summary?.lining_details?.type ? {
        type: summary.lining_details.type,
        name: summary.lining_details.name || summary.lining_details.type,
      } : undefined;
      
      const visualDetails = {
        thumbnailUrl: summary?.fabric_details?.image_url,
        showImage: true,
      };

      const item: WorkshopRoomItem = {
        id: s.id,
        name: s.name || "Window",
        roomName: getRoomName(s.room_id),
        location: s.name || "Window",
        quantity: 1,
        measurements: {
          width,
          height,
          drop: summary?.drop || summary?.measurements_details?.drop,
          pooling: summary?.measurements_details?.pooling || summary?.pooling_amount,
          unit: (width || height) ? getLengthUnitLabel() : undefined,
        },
        treatmentType: summary?.template_name || summary?.treatment_type || s.surface_type || undefined,
        notes: s.notes || undefined,
        summary: summary,
        surface: s,
        fabricDetails,
        fabricUsage,
        hems,
        fullness,
        options,
        liningDetails,
        visualDetails,
      };

      const section = ensureSectionByRoomId(s.room_id);
      section.items.push(item);
      section.totals = { count: (section.totals?.count || 0) + 1 };
    });

    const sections = Array.from(roomsMap.entries())
      .map(([key, section]) => ({ key, ...section }))
      .sort((a, b) => a.roomName.localeCompare(b.roomName))
      .map(({ key, ...rest }) => rest);

    console.log('🏭 [WORKROOM] Built sections:', {
      sectionsCount: sections.length,
      sections: sections.map(s => ({
        roomName: s.roomName,
        itemsCount: s.items.length
      }))
    });

    if (sections.length === 0) {
      console.warn('⚠️ [WORKROOM] No sections created - returning undefined');
      return undefined;
    }

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

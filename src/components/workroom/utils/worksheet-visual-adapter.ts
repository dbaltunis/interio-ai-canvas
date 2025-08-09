import type { WorkshopRoomItem } from "@/hooks/useWorkshopData";

// Map WorkshopRoomItem to the shape expected by WorksheetVisual
export const toWorksheetVisualData = (item: WorkshopRoomItem) => {
  const width = item.measurements?.width;
  const height = item.measurements?.height;

  // Pull optional details from saved summary if present
  const md = (item.summary?.measurements_details as Record<string, any>) || {};
  const s = (item.summary as Record<string, any>) || {};

  const measurements: Record<string, any> = {
    // Primary worksheet fields
    rail_width: width,
    drop: height,
    measurement_a: width, // Window width
    measurement_b: height, // Window height

    // Optional extended fields from worksheet data
    measurement_c: md.measurement_c ?? s.measurement_c,
    measurement_d: md.measurement_d ?? s.measurement_d,
    measurement_e: md.measurement_e ?? s.measurement_e,
    measurement_f: md.measurement_f ?? s.measurement_f,

    pooling_option: md.pooling_option ?? s.pooling_option,
    pooling_amount: md.pooling_amount ?? s.pooling_amount,

    curtain_type: md.curtain_type ?? s.curtain_type,
    curtain_side: md.curtain_side ?? s.curtain_side,
    hardware_type: (md.hardware_type ?? s.hardware_type)?.toLowerCase?.(),

    unit: item.measurements?.unit,
  };

  const windowType = item.surface?.window_type || item.surface?.type || item.name || "Window";

  // If you later add template support, pass it through here
  const selectedTemplate = undefined;

  return { windowType, measurements, selectedTemplate } as const;
};

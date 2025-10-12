import type { WorkshopRoomItem } from "@/hooks/useWorkshopData";

export const toTreatmentVisualizerData = (item: WorkshopRoomItem) => {
  const width = item.measurements?.width;
  const height = item.measurements?.height;

  const measurements = {
    measurement_a: width,
    measurement_b: height,
    rail_width: width,
    drop: height,
    unit: item.measurements?.unit,
  } as any;

  // CRITICAL: Use specific treatment_type from summary first (e.g., 'venetian_blinds'), not general category
  const specificType = item.summary?.treatment_type || item.treatmentType;
  const coveringName = specificType || item.surface?.surface_type || item.surface?.type || "Curtains";
  const covering = { id: String(coveringName), name: String(coveringName) };

  // Attempt to pull some helpful fields from summary if present
  const md = (item.summary?.measurements_details as Record<string, any>) || {};
  const treatmentData = {
    fullness_ratio: md.fullness_ratio || item.summary?.fullness_ratio || "2.0",
    heading_type: md.heading_type || item.summary?.heading_type || undefined,
    pooling: md.pooling || item.summary?.pooling || 0,
    slat_size: md.slat_size || item.summary?.slat_size || undefined,
    fold_spacing: md.fold_spacing || item.summary?.fold_spacing || undefined,
    fold_style: md.fold_style || item.summary?.fold_style || undefined,
    mounting_type: md.mounting_type || item.summary?.mounting_type || undefined,
    louver_size: md.louver_size || item.summary?.louver_size || undefined,
    panel_config: md.panel_config || item.summary?.panel_config || undefined,
  } as any;

  const windowType = item.surface?.window_type || item.surface?.type || item.name;

  return { windowType, measurements, covering, treatmentData } as const;
};

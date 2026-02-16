import { useMemo } from "react";
import { useSurfaces } from "@/hooks/useSurfaces";
import { useRooms } from "@/hooks/useRooms";
import { useProjectWindowSummaries } from "@/hooks/useProjectWindowSummaries";

export interface QuantityResolution {
  autoQuantity: number | null;
  breakdown: string;
  isAutomatic: boolean;
}

/**
 * Resolves the correct quantity for a service based on its pricing unit and project context.
 * - per-window: counts all surfaces in the project
 * - per-room: counts all rooms in the project
 * - per-metre: sums total_meters from window summaries (needs treatment selection externally)
 * - per-job / per-hour / flat-rate: returns null (manual)
 */
export const useServiceQuantityResolver = (projectId?: string) => {
  const { data: surfaces = [] } = useSurfaces(projectId);
  const { data: rooms = [] } = useRooms(projectId);
  const { data: summaries } = useProjectWindowSummaries(projectId);

  const windowCount = surfaces.length;
  const roomCount = rooms.length;

  const totalMeters = useMemo(() => {
    if (!summaries?.windows) return 0;
    return summaries.windows.reduce((sum, w) => {
      if (!w.summary) return sum;
      // Use width in meters from the summary
      const widthMm = Number((w.summary as any).width_mm || 0);
      return sum + (widthMm / 1000);
    }, 0);
  }, [summaries]);

  const resolve = (unit: string): QuantityResolution => {
    switch (unit) {
      case 'per-window':
        return {
          autoQuantity: windowCount,
          breakdown: `${windowCount} window${windowCount !== 1 ? 's' : ''} detected`,
          isAutomatic: true,
        };
      case 'per-room':
        return {
          autoQuantity: roomCount,
          breakdown: `${roomCount} room${roomCount !== 1 ? 's' : ''} detected`,
          isAutomatic: true,
        };
      case 'per-metre':
        return {
          autoQuantity: Math.round(totalMeters * 100) / 100,
          breakdown: `${totalMeters.toFixed(2)}m total from ${windowCount} window${windowCount !== 1 ? 's' : ''}`,
          isAutomatic: true,
        };
      case 'per-job':
      case 'per-hour':
      case 'flat-rate':
      default:
        return {
          autoQuantity: null,
          breakdown: 'Manual entry required',
          isAutomatic: false,
        };
    }
  };

  return { resolve, windowCount, roomCount, totalMeters };
};

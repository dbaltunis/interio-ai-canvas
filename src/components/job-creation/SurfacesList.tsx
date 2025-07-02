
import { SurfaceCard } from "./SurfaceCard";

interface SurfacesListProps {
  surfaces: any[];
  treatments: any[];
  onAddTreatment: (surfaceId: string, treatmentType: string, windowCovering?: any) => void;
  onDeleteSurface: (surfaceId: string) => void;
  onUpdateSurface: (surfaceId: string, updates: any) => void;
}

export const SurfacesList = ({
  surfaces,
  treatments,
  onAddTreatment,
  onDeleteSurface,
  onUpdateSurface
}: SurfacesListProps) => {
  if (surfaces.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <p className="mb-2">No surfaces added yet</p>
          <p className="text-sm">Add windows or walls to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {surfaces.map((surface) => {
        const surfaceTreatments = treatments.filter(t => t.window_id === surface.id);
        return (
          <SurfaceCard
            key={surface.id}
            surface={surface}
            treatments={surfaceTreatments}
            onAddTreatment={onAddTreatment}
            onDeleteSurface={onDeleteSurface}
            onUpdateSurface={onUpdateSurface}
          />
        );
      })}
    </div>
  );
};

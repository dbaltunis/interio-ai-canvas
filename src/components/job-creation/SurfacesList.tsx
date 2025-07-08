
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
  console.log("=== SURFACES LIST RENDER ===");
  console.log("Surfaces received:", surfaces);
  console.log("Surfaces length:", surfaces?.length);
  console.log("Treatments received:", treatments);
  
  // Ensure surfaces is always an array
  const safeSurfaces = Array.isArray(surfaces) ? surfaces : [];
  
  console.log("Safe surfaces:", safeSurfaces);
  console.log("Safe surfaces length:", safeSurfaces.length);
  
  if (safeSurfaces.length === 0) {
    console.log("No surfaces to display, showing empty state");
    return (
      <div className="flex-1 flex items-center justify-center text-brand-neutral">
        <div className="text-center">
          <div className="text-6xl mb-4">🪟</div>
          <p className="mb-2 text-brand-primary font-medium">No surfaces added yet</p>
          <p className="text-sm text-brand-neutral">Add windows or walls to get started</p>
        </div>
      </div>
    );
  }

  console.log("Rendering", safeSurfaces.length, "surfaces");
  
  return (
    <div className="space-y-3">
      {safeSurfaces.map((surface) => {
        console.log("Rendering surface:", surface);
        const surfaceTreatments = treatments.filter(t => t.window_id === surface.id);
        console.log("Surface treatments for", surface.id, ":", surfaceTreatments);
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

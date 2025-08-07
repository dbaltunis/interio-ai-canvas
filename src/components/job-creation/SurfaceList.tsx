import { useState } from "react";
import { WindowSummaryCard } from "./WindowSummaryCard";
import { useClientMeasurements } from "@/hooks/useClientMeasurements";
import { WindowManagementDialog } from "./WindowManagementDialog";

interface SurfaceListProps {
  surfaces: any[];
  treatments: any[];
  clientId?: string;
  projectId?: string;
  onAddTreatment: (surfaceId: string, treatmentType: string, treatmentData?: any) => void;
  onUpdateSurface: (surfaceId: string, updates: any) => void;
  onDeleteSurface: (surfaceId: string) => void;
}

export const SurfaceList = ({
  surfaces,
  treatments,
  clientId,
  projectId,
  onAddTreatment,
  onUpdateSurface,
  onDeleteSurface
}: SurfaceListProps) => {
  const [selectedSurface, setSelectedSurface] = useState<any>(null);
  const [showWindowDialog, setShowWindowDialog] = useState(false);
  
  const { data: clientMeasurements } = useClientMeasurements(clientId);

  const handleViewWindow = (surface: any) => {
    setSelectedSurface(surface);
    setShowWindowDialog(true);
  };

  const handleCloseWindow = () => {
    setSelectedSurface(null);
    setShowWindowDialog(false);
  };

  const getClientMeasurementForSurface = (surface: any) => {
    return clientMeasurements?.find(measurement => {
      const roomMatch = measurement.room_id === surface.room_id;
      const measurementData = typeof measurement.measurements === 'object' && measurement.measurements !== null 
        ? measurement.measurements as Record<string, any> 
        : {};
      const surfaceIdMatch = measurementData.surface_id === surface.id;
      const surfaceNameMatch = measurementData.surface_name === surface.name;
      
      return roomMatch || surfaceIdMatch || surfaceNameMatch;
    });
  };

  const getSurfaceTreatments = (surfaceId: string) => {
    return treatments.filter(t => t.window_id === surfaceId);
  };

  return (
    <>
      <div className="space-y-3">
        {surfaces.map((surface) => (
          <WindowSummaryCard 
            key={surface.id} 
            surface={surface} 
            onEditSurface={() => handleViewWindow(surface)}
            onDeleteSurface={onDeleteSurface}
            onViewDetails={() => handleViewWindow(surface)}
          />
        ))}
      </div>

      {/* Window Management Dialog */}
      {selectedSurface && (
        <WindowManagementDialog
          isOpen={showWindowDialog}
          onClose={handleCloseWindow}
          surface={{
            ...selectedSurface,
            room_name: surfaces.find(s => s.id === selectedSurface.id)?.room_name || 'Unknown Room'
          }}
          clientId={clientId}
          projectId={projectId || ''}
          existingMeasurement={getClientMeasurementForSurface(selectedSurface)}
          existingTreatments={getSurfaceTreatments(selectedSurface.id)}
          onSaveTreatment={(treatmentData) => onAddTreatment(selectedSurface.id, treatmentData.treatment_type, treatmentData)}
        />
      )}
    </>
  );
};
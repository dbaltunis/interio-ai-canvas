import { useState } from "react";
import { WindowSummaryCard } from "./WindowSummaryCard";
import { useClientMeasurements } from "@/hooks/useClientMeasurements";
import { WindowManagementDialog } from "./WindowManagementDialog";
import { AddTreatmentDialog } from "../measurements/AddTreatmentDialog";
import { useCompactMode } from "@/hooks/useCompactMode";


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
  const [showAddTreatmentDialog, setShowAddTreatmentDialog] = useState(false);
  const [addTreatmentWindow, setAddTreatmentWindow] = useState<any>(null);
  const { compact } = useCompactMode();
  
  const { data: clientMeasurements } = useClientMeasurements(clientId);

  const handleViewWindow = (surface: any) => {
    setSelectedSurface(surface);
    setShowWindowDialog(true);
  };

  const handleCloseWindow = () => {
    setSelectedSurface(null);
    setShowWindowDialog(false);
  };

  const handleRenameSurface = (surfaceId: string, newName: string) => {
    onUpdateSurface(surfaceId, { name: newName });
  };

  const handleAddTreatment = (surfaceId: string) => {
    const surface = surfaces.find(s => s.id === surfaceId);
    if (surface) {
      setAddTreatmentWindow(surface);
      setShowAddTreatmentDialog(true);
    }
  };

  const handleConfirmAddTreatment = (treatmentData: any) => {
    if (addTreatmentWindow) {
      onAddTreatment(addTreatmentWindow.id, treatmentData.type, treatmentData);
    }
    setShowAddTreatmentDialog(false);
    setAddTreatmentWindow(null);
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

  // Group surfaces by window/treatment logic
  const groupedSurfaces = surfaces.reduce((groups, surface) => {
    // Check if this is a duplicate window (same room + similar name pattern)
    const existingWindow = groups.find(group => 
      group.roomId === surface.room_id && 
      group.baseWindowName === surface.name.replace(/\s+\d+$/, '') // Remove trailing numbers
    );
    
    if (existingWindow) {
      // This is additional treatment for the same window
      existingWindow.treatments.push(surface);
    } else {
      // This is a new window
      groups.push({
        id: surface.id,
        roomId: surface.room_id,
        baseWindowName: surface.name.replace(/\s+\d+$/, ''),
        mainSurface: surface,
        treatments: []
      });
    }
    
    return groups;
  }, [] as Array<{
    id: string;
    roomId: string;
    baseWindowName: string;
    mainSurface: any;
    treatments: any[];
  }>);

  return (
    <>
      <div className={compact ? "space-y-2" : "space-y-3"}>
        {groupedSurfaces.map((group) => (
          <div key={group.id} className="space-y-2">
            {/* Main window surface */}
            <WindowSummaryCard 
              surface={group.mainSurface} 
              onEditSurface={() => handleViewWindow(group.mainSurface)}
              onDeleteSurface={onDeleteSurface}
              onViewDetails={() => handleViewWindow(group.mainSurface)}
              onRenameSurface={handleRenameSurface}
              onAddTreatment={handleAddTreatment}
              isMainWindow={true}
            />
            
            {/* Additional treatments for the same window */}
            {group.treatments.map((treatment, index) => (
              <div key={treatment.id} className="border-l-2 border-primary/20 ml-6 pl-4">
                <WindowSummaryCard 
                  surface={treatment}
                  onEditSurface={() => handleViewWindow(treatment)}
                  onDeleteSurface={onDeleteSurface}
                  onViewDetails={() => handleViewWindow(treatment)}
                  isMainWindow={false}
                  treatmentLabel={`${group.baseWindowName} - Treatment ${index + 2}`}
                  treatmentType="curtains"
                />
              </div>
            ))}
          </div>
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

      {/* Add Treatment Dialog */}
      {addTreatmentWindow && (
        <AddTreatmentDialog
          isOpen={showAddTreatmentDialog}
          onClose={() => {
            setShowAddTreatmentDialog(false);
            setAddTreatmentWindow(null);
          }}
          onAddTreatment={handleConfirmAddTreatment}
          windowName={addTreatmentWindow.name}
          existingTreatmentCount={getSurfaceTreatments(addTreatmentWindow.id).length}
        />
      )}
    </>
  );
};
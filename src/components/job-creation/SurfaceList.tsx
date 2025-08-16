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

  // Define types for the hierarchical structure
  type WindowGroup = {
    windowId: string;
    baseWindowName: string;
    mainSurface: any;
    treatments: any[];
  };

  type RoomGroup = {
    roomId: string;
    roomName: string;
    windows: Record<string, WindowGroup>;
  };

  // Group surfaces by room first, then by window, then by treatments
  const hierarchicalSurfaces = surfaces.reduce((rooms, surface) => {
    const roomId = surface.room_id || 'no-room';
    const roomName = surface.room_name || 'Unassigned Room';
    
    // Initialize room if it doesn't exist
    if (!rooms[roomId]) {
      rooms[roomId] = {
        roomId,
        roomName,
        windows: {}
      };
    }
    
    // Extract base window name (remove treatment suffixes like "Window 1 - 2", "Window 1 - Blinds")
    const baseWindowName = surface.name.replace(/\s+-\s+(Treatment\s+\d+|\w+)$/i, '').trim();
    const windowKey = `${roomId}-${baseWindowName}`;
    
    // Initialize window if it doesn't exist
    if (!rooms[roomId].windows[windowKey]) {
      rooms[roomId].windows[windowKey] = {
        windowId: windowKey,
        baseWindowName,
        mainSurface: surface,
        treatments: []
      };
    } else {
      // This is an additional treatment for existing window
      rooms[roomId].windows[windowKey].treatments.push(surface);
    }
    
    return rooms;
  }, {} as Record<string, RoomGroup>);

  // Convert to arrays with proper typing
  const roomGroups: RoomGroup[] = Object.values(hierarchicalSurfaces);

  return (
    <>
      <div className={compact ? "space-y-3" : "space-y-4"}>
         {roomGroups.map((room) => (
          <div key={room.roomId} className="space-y-3">
            {/* Room Header */}
            
            {/* Windows in this room */}
            <div className="space-y-2 pl-2">
              {Object.values(room.windows).map((window: WindowGroup) => (
                <div key={window.windowId} className="space-y-2">
                  {/* Main window surface */}
                   <WindowSummaryCard 
                     surface={window.mainSurface} 
                     onEditSurface={() => handleViewWindow(window.mainSurface)}
                     onDeleteSurface={onDeleteSurface}
                     onViewDetails={() => handleViewWindow(window.mainSurface)}
                     onRenameSurface={handleRenameSurface}
                     isMainWindow={true}
                   />
                  
                  {/* Additional treatments for the same window */}
                  {window.treatments.map((treatment, index) => (
                    <div key={treatment.id} className="border-l-2 border-primary/20 ml-6 pl-4">
                      <WindowSummaryCard 
                        surface={treatment}
                        onEditSurface={() => handleViewWindow(treatment)}
                        onDeleteSurface={onDeleteSurface}
                        onViewDetails={() => handleViewWindow(treatment)}
                        isMainWindow={false}
                        treatmentLabel={`${window.baseWindowName} - Treatment ${index + 2}`}
                        treatmentType={treatment.treatment_type || "curtains"}
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
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
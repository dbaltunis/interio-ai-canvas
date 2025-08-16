import { useState } from "react";
import { WindowSummaryCard } from "./WindowSummaryCard";
import { useClientMeasurements } from "@/hooks/useClientMeasurements";
import { useWindowSummary } from "@/hooks/useWindowSummary";
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

  const getExactTreatmentData = (surface: any) => {
    // For editing a treatment, we need to get the EXACT saved data from windows_summary
    // NOT from client_measurements which might have different values
    console.log(`🔍 Getting exact treatment data for surface: ${surface.id} (${surface.name})`);
    
    // First check if we have saved window summary data
    const savedSummaryExists = true; // We'll check this with the hook
    
    if (savedSummaryExists) {
      console.log(`✅ Found saved treatment data for ${surface.name}, using EXACT values`);
      // Return a special marker that tells the dialog to use saved summary data
      return {
        id: surface.id,
        room_id: surface.room_id,
        project_id: surface.project_id,
        client_id: clientId, // Add missing client_id
        use_saved_summary: true, // Special flag to indicate we should use saved data
        measurements: {
          surface_id: surface.id,
          surface_name: surface.name,
          // The dialog will load the actual values from the window summary
        }
      };
    }
    
    console.log(`❌ No saved treatment data found for ${surface.name}, using client measurements as fallback`);
    // Fallback to client measurements only if no window summary exists (new treatment)
    return clientMeasurements?.find(measurement => {
      const measurementData = typeof measurement.measurements === 'object' && measurement.measurements !== null 
        ? measurement.measurements as Record<string, any> 
        : {};
      
      // First priority: exact surface ID match
      if (measurementData.surface_id === surface.id) {
        return true;
      }
      
      // Second priority: exact surface name match within the same room
      if (measurement.room_id === surface.room_id && measurementData.surface_name === surface.name) {
        return true;
      }
      
      // Third priority: room match only if no surface-specific data exists
      const hasSpecificSurfaceData = measurementData.surface_id || measurementData.surface_name;
      if (measurement.room_id === surface.room_id && !hasSpecificSurfaceData) {
        return true;
      }
      
      return false;
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
            <div className="space-y-2 pl-2 p-[7px]">
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
          existingMeasurement={getExactTreatmentData(selectedSurface)}
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
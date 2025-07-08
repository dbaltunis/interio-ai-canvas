
import { Card, CardContent } from "@/components/ui/card";
import { useTreatments } from "@/hooks/useTreatments";
import { useSurfaces } from "@/hooks/useSurfaces";
import { TreatmentPricingForm } from "./TreatmentPricingForm";
import { TreatmentCalculatorDialog } from "./TreatmentCalculatorDialog";

import { RoomHeader } from "./RoomHeader";
import { SurfaceCreationButtons } from "./SurfaceCreationButtons";
import { SurfacesList } from "./SurfacesList";
import { useState } from "react";

interface RoomCardProps {
  room: any;
  projectId: string;
  onUpdateRoom: any;
  onDeleteRoom: any;
  onCreateTreatment: (roomId: string, surfaceId: string, treatmentType: string, treatmentData?: any) => void;
  onCreateSurface: (roomId: string, surfaceType: string) => void;
  onUpdateSurface: (surfaceId: string, updates: any) => void;
  onDeleteSurface: (surfaceId: string) => void;
  onCopyRoom: (room: any) => void;
  editingRoomId: string | null;
  setEditingRoomId: (id: string | null) => void;
  editingRoomName: string;
  setEditingRoomName: (name: string) => void;
  onRenameRoom: (roomId: string, newName: string) => void;
  onChangeRoomType: (roomId: string, roomType: string) => void;
}

export const RoomCard = ({ 
  room, 
  projectId, 
  onUpdateRoom, 
  onDeleteRoom, 
  onCreateTreatment,
  onCreateSurface,
  onUpdateSurface,
  onDeleteSurface,
  onCopyRoom,
  editingRoomId,
  setEditingRoomId,
  editingRoomName,
  setEditingRoomName,
  onRenameRoom,
  onChangeRoomType
}: RoomCardProps) => {
  const { data: allTreatments } = useTreatments(projectId);
  const { data: allSurfaces, isLoading: surfacesLoading } = useSurfaces(projectId);
  
  const roomSurfaces = allSurfaces?.filter(s => s.room_id === room.id) || [];
  const roomTreatments = allTreatments?.filter(t => t.room_id === room.id) || [];
  const roomTotal = roomTreatments.reduce((sum, t) => sum + (t.total_price || 0), 0);
  
  const [pricingFormOpen, setPricingFormOpen] = useState(false);
  const [calculatorDialogOpen, setCalculatorDialogOpen] = useState(false);
  
  // Store current form values directly
  const [currentFormData, setCurrentFormData] = useState({
    treatmentType: "",
    surfaceId: "",
    surfaceType: "",
    windowCovering: null as any
  });

  console.log("=== ROOM CARD DEBUG ===");
  console.log("Room:", room.name, "ID:", room.id);
  console.log("Project ID:", projectId);
  console.log("All surfaces:", allSurfaces);
  console.log("Room surfaces:", roomSurfaces);
  console.log("Surfaces loading:", surfacesLoading);

  const startEditing = () => {
    setEditingRoomId(room.id);
    setEditingRoomName(room.name);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onRenameRoom(room.id, editingRoomName);
      setEditingRoomId(null);
    } else if (e.key === 'Escape') {
      setEditingRoomId(null);
      setEditingRoomName("");
    }
  };

  const handleSurfaceCreation = async (surfaceType: 'window' | 'wall') => {
    console.log("=== ROOM CARD SURFACE CREATION ===");
    console.log("RoomCard handleSurfaceCreation called with surfaceType:", surfaceType);
    console.log("Room data:", room);
    console.log("Project ID:", projectId);
    
    if (!surfaceType) {
      console.error("No surfaceType provided!");
      return;
    }
    
    // Use the onCreateSurface prop which connects to JobHandlers
    onCreateSurface(room.id, surfaceType);
  };

  const handleAddTreatment = (surfaceId: string, treatmentType: string, windowCovering?: any) => {
    console.log("=== ROOM CARD - handleAddTreatment ===");
    console.log("handleAddTreatment called with:", { surfaceId, treatmentType, windowCovering });
    const surface = roomSurfaces.find(s => s.id === surfaceId);
    console.log("Found surface:", surface);
    
    const formData = {
      treatmentType,
      surfaceId,
      surfaceType: surface?.surface_type || 'window',
      windowCovering
    };
    
    console.log("Setting current form data:", formData);
    setCurrentFormData(formData);
    
    // Check if window covering has making cost - use calculator if it does
    if (windowCovering?.making_cost_id) {
      console.log("Opening calculator dialog");
      setCalculatorDialogOpen(true);
    } else {
      console.log("Opening pricing form");
      setPricingFormOpen(true);
    }
  };

  const handlePricingFormSave = (treatmentData: any) => {
    onCreateTreatment(room.id, currentFormData.surfaceId, currentFormData.treatmentType, treatmentData);
    setPricingFormOpen(false);
  };

  const handleCalculatorSave = (treatmentData: any) => {
    onCreateTreatment(room.id, currentFormData.surfaceId, currentFormData.treatmentType, treatmentData);
    setCalculatorDialogOpen(false);
  };

  if (surfacesLoading) {
    return (
      <Card className="bg-gray-100 min-h-[500px] flex flex-col">
        <RoomHeader
          room={room}
          roomTotal={roomTotal}
          editingRoomId={editingRoomId}
          editingRoomName={editingRoomName}
          setEditingRoomName={setEditingRoomName}
          onStartEditing={startEditing}
          onKeyPress={handleKeyPress}
          onRenameRoom={onRenameRoom}
          onCopyRoom={onCopyRoom}
          onDeleteRoom={onDeleteRoom}
          onChangeRoomType={onChangeRoomType}
        />
        
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-gray-500">Loading surfaces...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-gray-100 min-h-[500px] flex flex-col">
        <RoomHeader
          room={room}
          roomTotal={roomTotal}
          editingRoomId={editingRoomId}
          editingRoomName={editingRoomName}
          setEditingRoomName={setEditingRoomName}
          onStartEditing={startEditing}
          onKeyPress={handleKeyPress}
          onRenameRoom={onRenameRoom}
          onCopyRoom={onCopyRoom}
          onDeleteRoom={onDeleteRoom}
          onChangeRoomType={onChangeRoomType}
        />
        
        <CardContent className="flex-1 flex flex-col">
          <div className="space-y-4 flex-1">
            <SurfaceCreationButtons
              onCreateSurface={handleSurfaceCreation}
              isCreating={false}
            />

            <SurfacesList
              surfaces={roomSurfaces}
              treatments={roomTreatments}
              onAddTreatment={handleAddTreatment}
              onDeleteSurface={onDeleteSurface}
              onUpdateSurface={onUpdateSurface}
            />
          </div>
        </CardContent>
      </Card>

      <TreatmentPricingForm
        isOpen={pricingFormOpen}
        onClose={() => setPricingFormOpen(false)}
        onSave={handlePricingFormSave}
        treatmentType={currentFormData.treatmentType}
        surfaceType={currentFormData.surfaceType}
        windowCovering={currentFormData.windowCovering}
        projectId={projectId}
      />

      <TreatmentCalculatorDialog
        isOpen={calculatorDialogOpen}
        onClose={() => setCalculatorDialogOpen(false)}
        onSave={handleCalculatorSave}
        treatmentType={currentFormData.treatmentType}
      />
    </>
  );
};

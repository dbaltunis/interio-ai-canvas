
import { Card, CardContent } from "@/components/ui/card";
import { useTreatments } from "@/hooks/useTreatments";
import { useSurfaces } from "@/hooks/useSurfaces";
import { TreatmentPricingForm } from "./TreatmentPricingForm";
import { TreatmentCalculatorDialog } from "./TreatmentCalculatorDialog";

import { RoomHeader } from "./RoomHeader";
import { SurfaceCreationButtons } from "./SurfaceCreationButtons";
import { SurfacesList } from "./SurfacesList";
import { useSurfaceCreation } from "@/hooks/useSurfaceCreation";
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
  onRenameRoom
}: RoomCardProps) => {
  const { data: allTreatments } = useTreatments(projectId);
  const { data: allSurfaces } = useSurfaces(projectId);
  const { handleCreateSurface, isCreating } = useSurfaceCreation();
  
  const roomSurfaces = allSurfaces?.filter(s => s.room_id === room.id) || [];
  const roomTreatments = allTreatments?.filter(t => t.room_id === room.id) || [];
  const roomTotal = roomTreatments.reduce((sum, t) => sum + (t.total_price || 0), 0);
  
  const [pricingFormOpen, setPricingFormOpen] = useState(false);
  const [calculatorDialogOpen, setCalculatorDialogOpen] = useState(false);
  
  const [selectedTreatmentType, setSelectedTreatmentType] = useState("");
  const [selectedSurfaceId, setSelectedSurfaceId] = useState("");
  const [selectedSurfaceType, setSelectedSurfaceType] = useState("");
  const [selectedWindowCovering, setSelectedWindowCovering] = useState<any>(null);

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
    await handleCreateSurface(room, projectId, surfaceType, roomSurfaces);
  };

  const handleAddTreatment = (surfaceId: string, treatmentType: string, windowCovering?: any) => {
    const surface = roomSurfaces.find(s => s.id === surfaceId);
    setSelectedSurfaceId(surfaceId);
    setSelectedTreatmentType(treatmentType);
    setSelectedSurfaceType(surface?.surface_type || 'window');
    setSelectedWindowCovering(windowCovering);
    
    // Check if window covering has making cost - use calculator if it does
    if (windowCovering?.making_cost_id) {
      setCalculatorDialogOpen(true);
    } else {
      setPricingFormOpen(true);
    }
  };

  const handlePricingFormSave = (treatmentData: any) => {
    onCreateTreatment(room.id, selectedSurfaceId, selectedTreatmentType, treatmentData);
    setPricingFormOpen(false);
  };

  const handleCalculatorSave = (treatmentData: any) => {
    onCreateTreatment(room.id, selectedSurfaceId, selectedTreatmentType, treatmentData);
    setCalculatorDialogOpen(false);
  };

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
        />
        
        <CardContent className="flex-1 flex flex-col">
          <div className="space-y-4 flex-1">
            <SurfaceCreationButtons
              onCreateSurface={handleSurfaceCreation}
              isCreating={isCreating}
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
        treatmentType={selectedTreatmentType}
        surfaceType={selectedSurfaceType}
        windowCovering={selectedWindowCovering}
        projectId={projectId}
      />

      <TreatmentCalculatorDialog
        isOpen={calculatorDialogOpen}
        onClose={() => setCalculatorDialogOpen(false)}
        onSave={handleCalculatorSave}
        treatmentType={selectedTreatmentType}
      />
    </>
  );
};

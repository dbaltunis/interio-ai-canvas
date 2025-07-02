
import { Card, CardContent } from "@/components/ui/card";
import { useTreatments } from "@/hooks/useTreatments";
import { useSurfaces } from "@/hooks/useSurfaces";
import { TreatmentPricingForm } from "./TreatmentPricingForm";

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
  
  const [selectedTreatmentType, setSelectedTreatmentType] = useState("");
  const [selectedSurfaceId, setSelectedSurfaceId] = useState("");
  const [selectedSurfaceType, setSelectedSurfaceType] = useState("");

  const startEditing = () => {
    setEditingRoomId(room.id);
    setEditingRoomName(room.name);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onRenameRoom(room.id, editingRoomName);
    } else if (e.key === 'Escape') {
      setEditingRoomId(null);
      setEditingRoomName("");
    }
  };

  const handleSurfaceCreation = (surfaceType: 'window' | 'wall') => {
    handleCreateSurface(room, projectId, surfaceType, roomSurfaces);
  };

  const handleAddTreatment = (surfaceId: string, treatmentType: string) => {
    const surface = roomSurfaces.find(s => s.id === surfaceId);
    setSelectedSurfaceId(surfaceId);
    setSelectedTreatmentType(treatmentType);
    setSelectedSurfaceType(surface?.surface_type || 'window');
    
    setPricingFormOpen(true);
  };

  const handlePricingFormSave = (treatmentData: any) => {
    onCreateTreatment(room.id, selectedSurfaceId, selectedTreatmentType, treatmentData);
    setPricingFormOpen(false);
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
      />

    </>
  );
};

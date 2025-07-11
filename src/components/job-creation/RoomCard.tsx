
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useRoomCardLogic } from "./RoomCardLogic";
import { RoomCardContent } from "./RoomCardContent";
import { RoomTreatmentDialogs } from "./RoomTreatmentDialogs";

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
  const {
    surfacesLoading,
    roomSurfaces,
    roomTreatments,
    roomTotal,
    pricingFormOpen,
    setPricingFormOpen,
    calculatorDialogOpen,
    setCalculatorDialogOpen,
    currentFormData,
    handleAddTreatment
  } = useRoomCardLogic(room, projectId);

  // Use the parent's surface creation handler and track loading state locally
  const [isCreatingSurface, setIsCreatingSurface] = useState(false);
  
  const handleSurfaceCreation = async (surfaceType: 'window' | 'wall') => {
    setIsCreatingSurface(true);
    try {
      await onCreateSurface(room.id, surfaceType);
    } catch (error) {
      console.error("Surface creation failed:", error);
    } finally {
      setIsCreatingSurface(false);
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
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-brand-neutral">Loading surfaces...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <RoomCardContent
        room={room}
        roomTotal={roomTotal}
        roomSurfaces={roomSurfaces}
        roomTreatments={roomTreatments}
        editingRoomId={editingRoomId}
        setEditingRoomId={setEditingRoomId}
        editingRoomName={editingRoomName}
        setEditingRoomName={setEditingRoomName}
        onRenameRoom={onRenameRoom}
        onCopyRoom={onCopyRoom}
        onDeleteRoom={onDeleteRoom}
        onChangeRoomType={onChangeRoomType}
        onCreateSurface={handleSurfaceCreation}
        onAddTreatment={handleAddTreatment}
        onDeleteSurface={onDeleteSurface}
        onUpdateSurface={onUpdateSurface}
        isCreatingSurface={isCreatingSurface}
      />

      <RoomTreatmentDialogs
        projectId={projectId}
        pricingFormOpen={pricingFormOpen}
        calculatorDialogOpen={calculatorDialogOpen}
        currentFormData={currentFormData}
        onClosePricingForm={() => setPricingFormOpen(false)}
        onCloseCalculatorDialog={() => setCalculatorDialogOpen(false)}
        onPricingFormSave={handlePricingFormSave}
        onCalculatorSave={handleCalculatorSave}
      />
    </>
  );
};


import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useRoomCardLogic } from "./RoomCardLogic";
// import { RoomCardContent } from "./RoomCardContent";
// import { RoomTreatmentDialogs } from "./RoomTreatmentDialogs";

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
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2">{room.name}</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {room.description || "No description"}
        </p>
        <div className="text-center text-muted-foreground">
          Room details coming soon...
        </div>
      </CardContent>
    </>
  );
};

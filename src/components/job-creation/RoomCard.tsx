
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, RectangleHorizontal } from "lucide-react";
import { useRoomCardLogic } from "./RoomCardLogic";
import { RoomHeader } from "./RoomHeader";
import { SurfaceList } from "./SurfaceList";
import { useCompactMode } from "@/hooks/useCompactMode";


interface RoomCardProps {
  room: any;
  projectId: string;
  clientId?: string;
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
  clientId,
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
  } = useRoomCardLogic(room, projectId, clientId, onCreateTreatment);

  const { compact } = useCompactMode();

  const [isCreatingSurface, setIsCreatingSurface] = useState(false);
  
  const handleSurfaceCreation = async () => {
    setIsCreatingSurface(true);
    try {
      await onCreateSurface(room.id, 'window');
    } catch (error) {
      console.error("Surface creation failed:", error);
    } finally {
      setIsCreatingSurface(false);
    }
  };

  const handleStartEditing = () => {
    setEditingRoomId(room.id);
    setEditingRoomName(room.name);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onRenameRoom(room.id, editingRoomName);
      setEditingRoomId(null);
    } else if (e.key === 'Escape') {
      setEditingRoomId(null);
      setEditingRoomName(room.name);
    }
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
      <Card className="relative overflow-hidden rounded-3xl border border-brand-secondary/30 bg-gradient-to-br from-background/90 to-background/70 supports-[backdrop-filter]:bg-background/80 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5 hover:scale-[1.01] ring-1 ring-brand-secondary/20 hover:ring-brand-primary/30 animate-enter">
      {/* Ambient water-drop/glass layers */}
      <div className="pointer-events-none absolute inset-0">
        {/* Subtle inner border only for crispness */}
        <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-brand-secondary/20" />
      </div>
      <RoomHeader
        room={room}
        roomTotal={roomTotal}
        editingRoomId={editingRoomId}
        editingRoomName={editingRoomName}
        setEditingRoomName={setEditingRoomName}
        onStartEditing={handleStartEditing}
        onKeyPress={handleKeyPress}
        onRenameRoom={onRenameRoom}
        onCopyRoom={onCopyRoom}
        onDeleteRoom={onDeleteRoom}
        onChangeRoomType={onChangeRoomType}
      />

      <CardContent className={compact ? "p-4" : "p-6"}>
        <div className={compact ? "space-y-3" : "space-y-4"}>
          {/* Room Type Badge */}

          {/* Surfaces List */}
          {roomSurfaces.length > 0 ? (
            <SurfaceList
              surfaces={roomSurfaces}
              treatments={roomTreatments}
              clientId={clientId}
              projectId={projectId}
              onAddTreatment={handleAddTreatment}
              onUpdateSurface={onUpdateSurface}
              onDeleteSurface={onDeleteSurface}
            />
          ) : (
            <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
              <div className="text-4xl mb-2">🪟</div>
              <h4 className="font-medium text-foreground mb-1">No measurement worksheets added</h4>
              <p className="text-sm text-muted-foreground mb-4">Add measurement worksheets to get started with treatments</p>
            </div>
          )}

          {/* Add Window Button */}
          <div className="flex gap-2 pt-4 border-t border-gray-100">
            <Button
              onClick={handleSurfaceCreation}
              disabled={isCreatingSurface}
              variant="outline"
              size={compact ? "sm" : "sm"}
              className="flex-1"
            >
              <RectangleHorizontal className="h-4 w-4 mr-2" />
              Add Measurement Worksheet
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

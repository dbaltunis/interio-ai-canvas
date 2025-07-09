
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { RoomHeader } from "./RoomHeader";
import { SurfaceCreationButtons } from "./SurfaceCreationButtons";
import { SurfacesList } from "./SurfacesList";

interface RoomCardContentProps {
  room: any;
  roomTotal: number;
  roomSurfaces: any[];
  roomTreatments: any[];
  editingRoomId: string | null;
  setEditingRoomId: (id: string | null) => void;
  editingRoomName: string;
  setEditingRoomName: (name: string) => void;
  onRenameRoom: (roomId: string, newName: string) => void;
  onCopyRoom: (room: any) => void;
  onDeleteRoom: any;
  onChangeRoomType: (roomId: string, roomType: string) => void;
  onCreateSurface: (surfaceType: 'window' | 'wall') => void;
  onAddTreatment: (surfaceId: string, treatmentType: string, windowCovering?: any) => void;
  onDeleteSurface: (surfaceId: string) => void;
  onUpdateSurface: (surfaceId: string, updates: any) => void;
  isCreatingSurface: boolean;
}

export const RoomCardContent = ({ 
  room,
  roomTotal,
  roomSurfaces,
  roomTreatments,
  editingRoomId,
  setEditingRoomId,
  editingRoomName,
  setEditingRoomName,
  onRenameRoom,
  onCopyRoom,
  onDeleteRoom,
  onChangeRoomType,
  onCreateSurface,
  onAddTreatment,
  onDeleteSurface,
  onUpdateSurface,
  isCreatingSurface
}: RoomCardContentProps) => {
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

  return (
    <Card className="bg-brand-light min-h-[500px] flex flex-col border border-brand-secondary/20 shadow-md">
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
            onCreateSurface={onCreateSurface}
            isCreating={isCreatingSurface}
          />

          <SurfacesList
            surfaces={roomSurfaces}
            treatments={roomTreatments}
            onAddTreatment={onAddTreatment}
            onDeleteSurface={onDeleteSurface}
            onUpdateSurface={onUpdateSurface}
          />
        </div>
      </CardContent>
    </Card>
  );
};

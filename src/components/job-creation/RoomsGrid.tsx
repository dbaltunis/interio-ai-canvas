
import { useState } from "react";
import { RoomCard } from "./RoomCard";
import { Button } from "@/components/ui/button";
import { Plus, Home } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface RoomsGridProps {
  rooms: any[];
  projectId: string;
  onUpdateRoom: (roomId: string, updates: any) => void;
  onDeleteRoom: (roomId: string) => void;
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
  onCreateRoom: () => void;
  isCreatingRoom: boolean;
  onChangeRoomType: (roomId: string, roomType: string) => void;
}

export const RoomsGrid = ({ 
  rooms, 
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
  onCreateRoom, 
  isCreatingRoom, 
  onChangeRoomType 
}: RoomsGridProps) => {
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  if (!rooms || rooms.length === 0) {
    return (
      <Card className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Home className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No rooms yet</h3>
          <p className="text-gray-500 text-center mb-4">
            Create your first room to start designing window treatments
          </p>
          <Button onClick={onCreateRoom} disabled={isCreatingRoom}>
            <Plus className="mr-2 h-4 w-4" />
            {isCreatingRoom ? 'Creating...' : 'Create First Room'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {rooms.map((room) => (
        <RoomCard
          key={room.id}
          room={room}
          projectId={projectId}
          onUpdateRoom={onUpdateRoom}
          onDeleteRoom={onDeleteRoom}
          onCreateTreatment={onCreateTreatment}
          onCreateSurface={onCreateSurface}
          onUpdateSurface={onUpdateSurface}
          onDeleteSurface={onDeleteSurface}
          onCopyRoom={onCopyRoom}
          editingRoomId={editingRoomId}
          setEditingRoomId={setEditingRoomId}
          editingRoomName={editingRoomName}
          setEditingRoomName={setEditingRoomName}
          onRenameRoom={onRenameRoom}
          onChangeRoomType={onChangeRoomType}
        />
      ))}
    </div>
  );
};

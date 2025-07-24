
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { RoomCard } from "./RoomCard";
import { useProjects } from "@/hooks/useProjects";

interface RoomsGridProps {
  rooms: any[];
  projectId: string;
  onUpdateRoom: any;
  onDeleteRoom: any;
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
  const { data: projects } = useProjects();
  const project = projects?.find(p => p.id === projectId);

  const handleStartEdit = (room: any) => {
    setEditingRoomId(room.id);
    setEditingRoomName(room.name);
  };

  const handleSaveEdit = (roomId: string, newName: string) => {
    onRenameRoom(roomId, newName);
    setEditingRoomId(null);
  };

  const handleCancelEdit = () => {
    setEditingRoomId(null);
    setEditingRoomName("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Rooms</h3>
          <p className="text-sm text-gray-600">
            {rooms.length} room{rooms.length !== 1 ? 's' : ''} configured
          </p>
        </div>
        <Button onClick={onCreateRoom} disabled={isCreatingRoom}>
          <Plus className="h-4 w-4 mr-2" />
          Add Room
        </Button>
      </div>

      {rooms.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
          <div className="text-4xl mb-2">🏠</div>
          <h4 className="font-medium text-gray-900 mb-1">No rooms yet</h4>
          <p className="text-sm text-gray-500 mb-4">Start by adding your first room</p>
          <Button onClick={onCreateRoom} disabled={isCreatingRoom}>
            <Plus className="h-4 w-4 mr-2" />
            Add First Room
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              projectId={projectId}
              clientId={project?.client_id}
              isEditing={editingRoomId === room.id}
              editingName={editingRoomName}
              onStartEdit={handleStartEdit}
              onSaveEdit={handleSaveEdit}
              onCancelEdit={handleCancelEdit}
              onEditingNameChange={setEditingRoomName}
              onDeleteRoom={onDeleteRoom}
              onCreateSurface={onCreateSurface}
              onUpdateSurface={onUpdateSurface}
              onDeleteSurface={onDeleteSurface}
              onCopyRoom={onCopyRoom}
              onChangeRoomType={onChangeRoomType}
            />
          ))}
        </div>
      )}
    </div>
  );
};

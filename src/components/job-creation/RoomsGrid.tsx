
import { RoomCard } from "./RoomCard";
import { EmptyRoomsState } from "./EmptyRoomsState";

interface RoomsGridProps {
  rooms: any[];
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
  onCreateRoom: () => void;
  isCreatingRoom: boolean;
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
  isCreatingRoom
}: RoomsGridProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {!rooms || rooms.length === 0 ? (
        <div className="lg:col-span-2">
          <EmptyRoomsState onCreateRoom={onCreateRoom} isCreatingRoom={isCreatingRoom} />
        </div>
      ) : (
        rooms.map((room) => (
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
          />
        ))
      )}
    </div>
  );
};

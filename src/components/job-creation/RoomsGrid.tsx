
import { RoomCard } from "./RoomCard";
import { EmptyRoomsState } from "./EmptyRoomsState";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface RoomsGridProps {
  rooms: any[];
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
  onCreateRoom: () => void;
  isCreatingRoom: boolean;
  onChangeRoomType: (roomId: string, roomType: string) => void;
  onCreateFromTemplate?: (template: any, customName?: string) => void;
}

export const RoomsGrid = ({ 
  rooms, 
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
  onCreateRoom,
  isCreatingRoom,
  onChangeRoomType,
  onCreateFromTemplate
}: RoomsGridProps) => {
  return (
    <div className="space-y-6">
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
              clientId={clientId}
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
          ))
        )}
      </div>
      
      {/* Add Room Button - always show when there are existing rooms */}
      {rooms && rooms.length > 0 && (
        <div className="flex justify-center">
          <Button
            onClick={onCreateRoom}
            disabled={isCreatingRoom}
            variant="outline"
            size="lg"
            className="flex items-center space-x-2 px-8 py-4 border-2 border-dashed border-muted-foreground/30 hover:border-primary hover:bg-primary/5"
          >
            <Plus className="h-5 w-5" />
            <span>{isCreatingRoom ? 'Adding Room...' : 'Add Another Room'}</span>
          </Button>
        </div>
      )}
    </div>
  );
};

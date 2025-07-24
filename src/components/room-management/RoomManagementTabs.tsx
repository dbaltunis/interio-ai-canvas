
import { RoomsGrid } from "../job-creation/RoomsGrid";

interface RoomManagementTabsProps {
  rooms: any[];
  surfaces: any[];
  treatments: any[];
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

export const RoomManagementTabs = ({
  rooms,
  surfaces,
  treatments,
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
}: RoomManagementTabsProps) => {
  return (
    <div className="space-y-6">
      <RoomsGrid
        rooms={rooms}
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
        onCreateRoom={onCreateRoom}
        isCreatingRoom={isCreatingRoom}
        onChangeRoomType={onChangeRoomType}
        onCreateFromTemplate={onCreateFromTemplate}
      />
    </div>
  );
};

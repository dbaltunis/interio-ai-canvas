import { useState } from "react";
import { RoomsGrid } from "./RoomsGrid";
import { useRooms, useCreateRoom, useUpdateRoom, useDeleteRoom } from "@/hooks/useRooms";
import { useSurfaces, useCreateSurface, useUpdateSurface, useDeleteSurface } from "@/hooks/useSurfaces";
import { useCreateTreatment } from "@/hooks/useTreatments";
import { Skeleton } from "@/components/ui/skeleton";

interface ProjectJobsTabProps {
  project: any;
  onProjectUpdate?: (updatedProject: any) => void;
}

export const ProjectJobsTab = ({ project, onProjectUpdate }: ProjectJobsTabProps) => {
  const projectId = project?.id;

  // Fetch rooms for this project
  const { data: rooms = [], isLoading: roomsLoading } = useRooms(projectId);

  // Room mutations
  const createRoom = useCreateRoom();
  const updateRoom = useUpdateRoom();
  const deleteRoom = useDeleteRoom();

  // Surface mutations
  const createSurface = useCreateSurface();
  const updateSurface = useUpdateSurface();
  const deleteSurface = useDeleteSurface();

  // Treatment mutation
  const createTreatment = useCreateTreatment();

  // Local state for room editing
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [editingRoomName, setEditingRoomName] = useState("");

  // Handlers
  const handleCreateRoom = () => {
    if (!projectId) return;
    createRoom.mutate({
      project_id: projectId,
      name: `Room ${rooms.length + 1}`,
      room_type: "living_room"
    });
  };

  const handleUpdateRoom = (roomId: string, updates: any) => {
    updateRoom.mutate({ id: roomId, ...updates });
  };

  const handleDeleteRoom = (roomId: string) => {
    deleteRoom.mutate(roomId);
  };

  const handleRenameRoom = (roomId: string, newName: string) => {
    updateRoom.mutate({ id: roomId, name: newName });
    setEditingRoomId(null);
    setEditingRoomName("");
  };

  const handleChangeRoomType = (roomId: string, roomType: string) => {
    updateRoom.mutate({ id: roomId, room_type: roomType });
  };

  const handleCopyRoom = (room: any) => {
    if (!projectId) return;
    createRoom.mutate({
      project_id: projectId,
      name: `${room.name} (Copy)`,
      room_type: room.room_type
    });
  };

  const handleCreateSurface = (roomId: string, surfaceType: string) => {
    createSurface.mutate({
      room_id: roomId,
      surface_type: surfaceType,
      name: `${surfaceType} surface`
    });
  };

  const handleUpdateSurface = (surfaceId: string, updates: any) => {
    updateSurface.mutate({ id: surfaceId, ...updates });
  };

  const handleDeleteSurface = (surfaceId: string) => {
    deleteSurface.mutate(surfaceId);
  };

  const handleCreateTreatment = (roomId: string, surfaceId: string, treatmentType: string, treatmentData?: any) => {
    createTreatment.mutate({
      surface_id: surfaceId,
      treatment_type: treatmentType,
      ...treatmentData
    });
  };

  if (!projectId) {
    return (
      <div className="liquid-glass rounded-xl p-6">
        <p className="text-muted-foreground">No project selected</p>
      </div>
    );
  }

  if (roomsLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <RoomsGrid
        rooms={rooms}
        projectId={projectId}
        clientId={project?.client_id}
        onUpdateRoom={handleUpdateRoom}
        onDeleteRoom={handleDeleteRoom}
        onCreateTreatment={handleCreateTreatment}
        onCreateSurface={handleCreateSurface}
        onUpdateSurface={handleUpdateSurface}
        onDeleteSurface={handleDeleteSurface}
        onCopyRoom={handleCopyRoom}
        editingRoomId={editingRoomId}
        setEditingRoomId={setEditingRoomId}
        editingRoomName={editingRoomName}
        setEditingRoomName={setEditingRoomName}
        onRenameRoom={handleRenameRoom}
        onCreateRoom={handleCreateRoom}
        isCreatingRoom={createRoom.isPending}
        isCopyingRoom={createRoom.isPending}
        onChangeRoomType={handleChangeRoomType}
      />
    </div>
  );
};

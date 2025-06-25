
import { useState } from "react";
import { JobHeader } from "./JobHeader";
import { JobActionBar } from "./JobActionBar";
import { RoomsGrid } from "./RoomsGrid";
import { useJobHandlers } from "./JobHandlers";

interface ProjectJobsTabProps {
  project: any;
  onBack?: () => void;
}

export const ProjectJobsTab = ({ project, onBack }: ProjectJobsTabProps) => {
  const {
    rooms,
    roomsLoading,
    allTreatments,
    createRoom,
    updateRoom,
    deleteRoom,
    handleCreateRoom,
    handleRenameRoom,
    handleCreateSurface,
    handleUpdateSurface,
    handleDeleteSurface,
    handleCopyRoom,
    handlePasteRoom,
    handleCreateTreatment
  } = useJobHandlers(project);

  const [copiedRoom, setCopiedRoom] = useState<any>(null);
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [editingRoomName, setEditingRoomName] = useState("");

  console.log("Project:", project);
  console.log("Rooms:", rooms);

  // Calculate total amount from all treatments for this project
  const projectTreatments = allTreatments?.filter(t => t.project_id === project.id) || [];
  const totalAmount = projectTreatments.reduce((sum, t) => sum + (t.total_price || 0), 0);

  const handleCopyRoomClick = (room: any) => {
    const copiedData = handleCopyRoom(room);
    setCopiedRoom(copiedData);
  };

  const handlePasteRoomClick = async () => {
    await handlePasteRoom(copiedRoom);
  };

  const handleRenameRoomComplete = async (roomId: string, newName: string) => {
    await handleRenameRoom(roomId, newName);
    setEditingRoomId(null);
    setEditingRoomName("");
  };

  if (roomsLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-lg">Loading rooms...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <JobHeader
        jobNumber={project.job_number}
        totalAmount={totalAmount}
        onCreateRoom={handleCreateRoom}
        isCreatingRoom={createRoom.isPending}
      />

      <JobActionBar
        copiedRoom={copiedRoom}
        onPasteRoom={handlePasteRoomClick}
      />

      <RoomsGrid
        rooms={rooms}
        projectId={project.id}
        onUpdateRoom={updateRoom}
        onDeleteRoom={deleteRoom}
        onCreateTreatment={handleCreateTreatment}
        onCreateSurface={handleCreateSurface}
        onUpdateSurface={handleUpdateSurface}
        onDeleteSurface={handleDeleteSurface}
        onCopyRoom={handleCopyRoomClick}
        editingRoomId={editingRoomId}
        setEditingRoomId={setEditingRoomId}
        editingRoomName={editingRoomName}
        setEditingRoomName={setEditingRoomName}
        onRenameRoom={handleRenameRoomComplete}
        onCreateRoom={handleCreateRoom}
      />
    </div>
  );
};

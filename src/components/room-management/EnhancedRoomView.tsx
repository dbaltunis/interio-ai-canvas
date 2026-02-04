import { useState } from "react";
import { useJobHandlers } from "../job-creation/JobHandlers";
import { RoomManagementTabs } from "./RoomManagementTabs";
import { useFriendlyToast } from "@/hooks/use-friendly-toast";
import { useAuth } from "@/components/auth/AuthProvider";
import { useIsDealer } from "@/hooks/useIsDealer";
import { useHasPermission } from "@/hooks/usePermissions";

interface EnhancedRoomViewProps {
  project: any;
  clientId?: string;
  isReadOnly?: boolean;
}

export const EnhancedRoomView = ({ project, clientId, isReadOnly: propIsReadOnly }: EnhancedRoomViewProps) => {
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [editingRoomName, setEditingRoomName] = useState("");
  const { showError } = useFriendlyToast();
  const { user } = useAuth();
  const { data: isDealer } = useIsDealer();
  const canEditAllJobs = useHasPermission('edit_all_jobs');
  const canEditAssignedJobs = useHasPermission('edit_assigned_jobs');
  
  // Dealers can ALWAYS edit their own jobs (this is their core function - generating quotes)
  const isDealerOwnJob = isDealer === true && project?.user_id === user?.id;
  
  // If both permissions are disabled, no job should be editable
  // If both are enabled, all jobs are editable
  // If only "Edit Any Job" is enabled, only jobs created by the user should be editable
  // If only "Edit Assigned Jobs" is enabled, only assigned jobs should be editable
  const canEditJob = isDealerOwnJob
    ? true // Dealers can always edit their own jobs
    : (!canEditAllJobs && !canEditAssignedJobs) 
      ? false 
      : (canEditAllJobs && canEditAssignedJobs) 
        ? true 
        : (canEditAllJobs && !canEditAssignedJobs) 
          ? project?.user_id === user?.id 
          : (canEditAssignedJobs && !canEditAllJobs) 
            ? project?.user_id === user?.id 
            : false;
  const isReadOnly = propIsReadOnly !== undefined ? propIsReadOnly : !canEditJob;

  const {
    rooms,
    roomsLoading,
    allSurfaces,
    allTreatments,
    handleCreateRoom,
    handleRenameRoom,
    handleChangeRoomType,
    handleDeleteRoom,
    handleCreateSurface,
    handleUpdateSurface,
    handleDeleteSurface,
    handleCopyRoom,
    handleCreateTreatment,
    createRoom
  } = useJobHandlers(project);

  const handleCreateFromTemplate = async (template: any, customName?: string) => {
    try {
      // Create the room
      const actualProjectId = project.project_id || project.id;
      const newRoom = await createRoom.mutateAsync({
        project_id: actualProjectId,
        name: customName || template.name,
        room_type: template.type
      });

      // Create surfaces from template
      for (const surfaceTemplate of template.surfaces) {
        await handleCreateSurface(newRoom.id, surfaceTemplate.type);
      }
    } catch (error) {
      console.error("Failed to create room from template:", error);
      showError(error, { context: 'create room from template' });
    }
  };

  if (roomsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading rooms...</div>
      </div>
    );
  }

  return (
    <RoomManagementTabs
      rooms={rooms || []}
      surfaces={allSurfaces || []}
      treatments={allTreatments || []}
      projectId={project.project_id || project.id}
      clientId={clientId || project.client_id}
      onUpdateRoom={() => {}}
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
      onCreateFromTemplate={handleCreateFromTemplate}
      isReadOnly={isReadOnly}
    />
  );
};

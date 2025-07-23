
import { useState } from "react";
import { useJobHandlers } from "../job-creation/JobHandlers";
import { VisualRoomManagementTabs } from "./VisualRoomManagementTabs";
import { useToast } from "@/hooks/use-toast";

interface EnhancedRoomViewProps {
  project: any;
}

export const EnhancedRoomView = ({ project }: EnhancedRoomViewProps) => {
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [editingRoomName, setEditingRoomName] = useState("");
  const { toast } = useToast();

  const {
    rooms,
    roomsLoading,
    allSurfaces,
    allTreatments,
    handleCreateRoom,
    handleRenameRoom,
    handleChangeRoomType,
    handleCreateSurface,
    handleUpdateSurface,
    handleDeleteSurface,
    handleCopyRoom,
    handleCreateTreatment,
    createRoom
  } = useJobHandlers(project);

  const handleCreateFromTemplate = async (template: any, customName?: string) => {
    try {
      const actualProjectId = project.project_id || project.id;
      const newRoom = await createRoom.mutateAsync({
        project_id: actualProjectId,
        name: customName || template.name,
        room_type: template.type
      });

      for (const surfaceTemplate of template.surfaces) {
        await handleCreateSurface(newRoom.id, surfaceTemplate.type);
      }

      toast({
        title: "Success",
        description: `Room created from template: ${customName || template.name}`,
      });
    } catch (error) {
      console.error("Failed to create room from template:", error);
      toast({
        title: "Error",
        description: "Failed to create room from template",
        variant: "destructive",
      });
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
    <VisualRoomManagementTabs
      rooms={rooms || []}
      surfaces={allSurfaces || []}
      treatments={allTreatments || []}
      projectId={project.project_id || project.id}
      clientId={project.client_id}
      onUpdateRoom={() => {}}
      onDeleteRoom={() => {}}
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
      onChangeRoomType={handleChangeRoomType}
      onCreateFromTemplate={handleCreateFromTemplate}
    />
  );
};

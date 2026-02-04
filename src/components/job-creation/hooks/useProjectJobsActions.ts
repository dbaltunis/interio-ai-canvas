
import { useState } from "react";
import { useCreateRoom } from "@/hooks/useRooms";
import { useUpdateProject } from "@/hooks/useProjects";
import { useFriendlyToast } from "@/hooks/use-friendly-toast";
import { useCanEditJob } from "@/hooks/useJobEditPermissions";

interface UseProjectJobsActionsProps {
  project: any;
  rooms: any[];
  onProjectUpdate?: (updatedProject: any) => void;
}

export const useProjectJobsActions = ({
  project,
  rooms,
  onProjectUpdate
}: UseProjectJobsActionsProps) => {
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const createRoom = useCreateRoom();
  const updateProject = useUpdateProject();
  const { showError } = useFriendlyToast();
  // Use explicit permissions hook for edit checks
  const { canEditJob } = useCanEditJob(project);

  const handleCreateRoom = async () => {
    // Check permissions
    if (!canEditJob) {
      showError(new Error("permission denied"), { context: 'edit this job' });
      return;
    }

    // Determine the actual project ID
    const projectId = project?.project_id || project?.id;
    if (!projectId) {
      showError(new Error("No project selected"), { context: 'create room' });
      return;
    }

    setIsCreatingRoom(true);
    try {
      const roomNumber = (rooms?.length || 0) + 1;
      console.log("Creating room with project_id:", projectId);
      
      await createRoom.mutateAsync({
        project_id: projectId,
        name: `Room ${roomNumber}`,
        room_type: "living_room"
      });
      
      console.log("Room created successfully");
    } catch (error) {
      console.error("Failed to create room:", error);
      // Error already handled in mutation onError
    } finally {
      setIsCreatingRoom(false);
    }
  };

  const handleUpdateProjectName = async (name: string) => {
    if (!name.trim()) {
      throw new Error("Project name cannot be empty");
    }

    // Check permissions
    if (!canEditJob) {
      showError(new Error("permission denied"), { context: 'edit this job' });
      throw new Error("Permission denied");
    }

    // Determine the actual project ID
    const projectId = project?.project_id || project?.id;
    if (!projectId) {
      throw new Error("No project ID found");
    }

    try {
      console.log("Updating project name:", { id: projectId, name: name.trim() });
      
      const updatedProject = await updateProject.mutateAsync({
        id: projectId,
        name: name.trim()
      });
      
      console.log("Project name updated successfully:", updatedProject);
      
      // Notify parent component of the update
      if (onProjectUpdate) {
        onProjectUpdate(updatedProject);
      }
      
      return updatedProject;
    } catch (error) {
      console.error("Failed to update project name:", error);
      throw error;
    }
  };

  return {
    isCreatingRoom,
    handleCreateRoom,
    handleUpdateProjectName
  };
};
